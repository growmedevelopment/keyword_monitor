<?php

namespace App\Services;

use App\Models\Keyword;
use App\Models\DataForSeoTask;
use App\Models\Project;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KeywordSubmissionService
{
    public function submitKeyword(Project $project, string $newKeyword): Keyword
    {
        $credentials = $this->getCredentials();
        $keyword = $this->createAndAttachKeyword($project, $newKeyword);
        $payload = $this->buildPayload($keyword, $project);

        $this->submitToDataForSeo($payload, $keyword, $project, $credentials);
        usleep(200000); // Respect API rate limits

        return $keyword;
    }

    private function getCredentials(): array
    {
        $username = config('services.dataforseo.username');
        $password = config('services.dataforseo.password');

        if (!$username || !$password) {
            throw new \Exception('Missing DataForSEO credentials.');
        }

        return compact('username', 'password');
    }

    private function createAndAttachKeyword(Project $project, string $newKeyword): Keyword
    {
        $keyword = $project->keywords()->create([
            'keyword'  => $newKeyword,
            'location' => $project->location_code,
        ]);

        return $keyword->refresh();
    }

    private function buildPayload(Keyword $keyword, Project $project): array
    {
        return [[
            "keyword"        => mb_convert_encoding($keyword->keyword, "UTF-8"),
            "location_code"  => $keyword->location,
            "language_code"  => $keyword->language,
            "priority"       => $keyword->tracking_priority,
            "tag"            => "keyword_{$keyword->id}_project_{$project->id}",
        ]];
    }

    private function submitToDataForSeo(array $payload, Keyword $keyword, Project $project, array $credentials): void
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
                    'status'       => 'Submitted',
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
