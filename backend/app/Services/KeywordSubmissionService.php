<?php

namespace App\Services;

use App\Models\DataForSeoResult;
use App\Models\Keyword;
use App\Models\DataForSeoTask;
use App\Models\KeywordRank;
use App\Models\Project;
use App\Services\DataForSeo\CredentialsService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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
        $credentials = CredentialsService::get();
        $keyword = $this->createAndAttachKeyword($project, $newKeyword);

        $payload = $this->buildPayload($keyword, $project);
        $this->submitToDataForSeo($payload, $keyword, $project, $credentials);
        usleep(200000); // Respect API rate limits

        return $keyword;
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
     */
    public function submitToDataForSeo(array $payload, Keyword $keyword, Project $project, array $credentials): array
    {
        try {
            $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
                ->post('https://api.dataforseo.com/v3/serp/google/organic/task_post', $payload);

            $json = $response->json();

            Log::info('DataForSEO response after submitting keyword', ['data' => $json]);

            if ($response->successful() && isset($json['tasks'][0]['id'])) {
                $task = $json['tasks'][0];

                $taskModel = DataForSeoTask::create([
                    'keyword_id'   => $keyword->id,
                    'project_id'   => $project->id,
                    'task_id'      => $task['id'],
                    'status_message' => $task['status_message'],
                    'status_code' => $task['status_code'],
                    'cost'         => $task['cost'],
                    'submitted_at' => now(),
                    'raw_response' => json_encode($task, JSON_THROW_ON_ERROR),
                ]);

                return [
                    'success' => true,
                    'message' => 'Task created successfully.',
                    'task'    => $taskModel,
                    'api_response' => $task,
                ];
            }

            Log::warning('Invalid DataForSEO response.', [
                'keyword'  => $keyword->keyword,
                'response' => $json,
            ]);

            return [
                'success' => false,
                'message' => 'Invalid response from DataForSEO.',
                'errors'  => $json,
            ];
        } catch (\Throwable $e) {
            Log::error('Failed to submit keyword to DataForSEO.', [
                'keyword' => $keyword->keyword,
                'error'   => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Exception occurred during submission.',
                'errors'  => $e->getMessage(),
            ];
        }
    }

    public function removeKeyword(Keyword $keyword): void
    {

        DB::transaction(static function () use ($keyword) {
            // Collect task IDs for this keyword
            $taskIds = DataForSeoTask::query()
                ->where('keyword_id', $keyword->id)
                ->pluck('id');

            // 1) Delete results for those tasks
            if ($taskIds->isNotEmpty()) {
                DataForSeoResult::query()
                    ->whereIn('data_for_seo_task_id', $taskIds)
                    ->delete();
            }

            // 2) Delete tasks
            DataForSeoTask::query()
                ->where('keyword_id', $keyword->id)
                ->delete();

            // 3) Delete ranks
            KeywordRank::query()
                ->where('keyword_id', $keyword->id)
                ->delete();

            // 4) Finally, delete the keyword (hard delete)
            $keyword->forceDelete();
        });

    }


}
