<?php

namespace App\Services;

use App\Enums\DataForSeoTaskStatus;
use App\Models\Keyword;
use App\Models\DataForSeoTask;
use App\Models\Project;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KeywordSubmissionService
{

    /**
     * Submit a new keyword for tracking via the DataForSEO API.
     *
     * This method retrieves API credentials, creates and attaches the keyword
     * to the given project, builds the API payload, and submits it to DataForSEO.
     * A short delay is added to respect API rate limits.
     *
     * @param Project $project     The project to associate the keyword with.
     * @param string  $newKeyword  The keyword string to be submitted for tracking.
     *
     * @return Keyword             The created Keyword model instance.
     *
     * @throws \Exception          If credentials are missing or API submission fails.
     */
    public function submitKeyword(Project $project, string $newKeyword): Keyword
    {
        $credentials = $this->getCredentials();
        $keyword = $this->createAndAttachKeyword($project, $newKeyword);
        $payload = $this->buildPayload($keyword, $project);

        $this->submitToDataForSeo($payload, $keyword, $project, $credentials);
        usleep(200000); // Respect API rate limits

        return $keyword;
    }

    /**
     * Retrieve DataForSEO API credentials from the configuration.
     *
     * This method fetches the username and password stored in the `services.dataforseo`
     * configuration. If either credential is missing, it throws an exception.
     *
     * @throws \Exception If the DataForSEO credentials are not configured.
     *
     * @return array      An associative array containing 'username' and 'password'.
     */
    public function getCredentials(): array
    {
        $username = config('services.dataforseo.username');
        $password = config('services.dataforseo.password');

        if (!$username || !$password) {
            throw new \Exception('Missing DataForSEO credentials.');
        }

        return compact('username', 'password');
    }

    /**
     * Create a new keyword and attach it to the given project.
     *
     * This method creates a keyword record associated with the provided project,
     * using the project's location code, and returns the freshly created Keyword model.
     *
     * @param Project $project     The project to which the keyword will be attached.
     * @param string  $newKeyword  The keyword string to be stored in the database.
     *
     * @return Keyword             The newly created and refreshed Keyword model instance.
     */
    private function createAndAttachKeyword(Project $project, string $newKeyword): Keyword
    {
        $keyword = $project->keywords()->create([
            'keyword'  => $newKeyword,
            'location' => $project->location_code,
        ]);

        return $keyword->refresh();
    }

    /**
     * Build the payload array for submitting a keyword task to the DataForSEO API.
     *
     * This method constructs the required payload format, including the keyword,
     * location, language, tracking priority, and a unique tag combining the keyword
     * and project IDs.
     *
     * @param Keyword $keyword  The keyword model instance containing keyword details.
     * @param Project $project  The project model instance to associate with the payload.
     *
     * @return array            The formatted payload ready to be sent to the DataForSEO API.
     */
    public function buildPayload(Keyword $keyword, Project $project): array
    {
        return [[
            "keyword"        => mb_convert_encoding($keyword->keyword, "UTF-8"),
            "location_code"  => $keyword->location,
            "language_code"  => $keyword->language,
            "priority"       => $keyword->tracking_priority,
            "tag"            => "keyword_{$keyword->id}_project_{$project->id}",
        ]];
    }

    /**
     * Submit a keyword task to the DataForSEO API for SERP analysis.
     *
     * This method sends a POST request to the DataForSEO API to create a Google organic SERP task
     * for the given keyword and project. If successful, it stores the task details in the database.
     * Logs responses and handles errors appropriately.
     *
     * @param array   $payload      The request payload to send to the DataForSEO API.
     * @param Keyword $keyword      The keyword model instance associated with the task.
     * @param Project $project      The project model instance linked to the keyword.
     * @param array   $credentials  API credentials containing 'username' and 'password' for authentication.
     *
     * @throws \Exception           Throws an exception if the API submission fails or returns an invalid response.
     *
     * @return void
     */
    public function submitToDataForSeo(array $payload, Keyword $keyword, Project $project, array $credentials): void
    {
        try {
            $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
                ->post('https://api.dataforseo.com/v3/serp/google/organic/task_post', $payload);

            $json = $response->json();

            Log::info('DataForSEO response after submit keyword ToDataForSeo and create a task', [
                'data' => $response->json(),
            ]);

            if ($response->successful() && isset($json['tasks'][0]['id'])) {
                $task = $json['tasks'][0];

                DataForSeoTask::create([
                    'keyword_id'   => $keyword->id,
                    'project_id'   => $project->id,
                    'task_id'      => $task['id'],
                    'status'       => DataForSeoTaskStatus::SUBMITTED,
                    'cost'         => $task['cost'],
                    'submitted_at' => now(),
                    'raw_response' => json_encode($task),
                ]);
            } else {
                Log::warning('Invalid DataForSEO response.', [
                    'keyword'  => $keyword->keyword,
                    'response' => $json,
                ]);

                throw new \Exception('Failed to submit keyword: ' . json_encode($json));
            }
        } catch (\Throwable $e) {
            Log::error('Failed to submit keyword', [
                'keyword' => $keyword->keyword,
                'error'   => $e->getMessage(),
            ]);

            throw new \Exception($e->getMessage());
        }
    }
}
