<?php

namespace App\Services;

use App\Http\Resources\ProjectViewResource;
use App\Models\DataForSeoTask;
use App\Models\Keyword;
use App\Models\DataForSeoResult;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DataForSeoResultService
{
    public function fetchSEOResultsByKeyword(Keyword $keyword): Collection
    {
        $credentials = $this->getCredentials();
        $projectUrl = $keyword->project->url;
        $tasks = $this->getSubmittedTasks($keyword);

        return $this->processTasks($tasks, $projectUrl, $credentials);
    }

    public function fetchSEOResultsBySubmittedTasks(ProjectViewResource $project): Collection
    {
        $credentials = $this->getCredentials();
        $projectUrl = $project->url;

        $tasks = DataForSeoTask::whereHas('keyword', function ($query) use ($project) {
            $query->where('project_id', $project->id);
        })->where('status', 'Submitted')->get();

        if($tasks->isNotEmpty()){
            return $this->processTasks($tasks, $projectUrl, $credentials);
        };

        return collect();

    }

    private function getCredentials(): array
    {
        $username = config('services.dataforseo.username');
        $password = config('services.dataforseo.password');

        if (!$username || !$password) {
            throw new \RuntimeException('Missing DataForSEO credentials.');
        }

        return compact('username', 'password');
    }

    private function getSubmittedTasks(Keyword $keyword): Collection
    {
        return $keyword->dataForSeoTasks()->where('status', 'Submitted')->get();
    }

    private function fetchTaskResult(string $taskId, array $credentials): ?array
    {
        $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
            ->get("https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/{$taskId}");

        if (!$response->successful()) {
            Log::warning('Failed to fetch DataForSEO task result', [
                'task_id' => $taskId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return null;
        }

        Log::info('DataForSEO task results response', [
            'task_id' => $taskId,
            'data' => $response->json(),
        ]);

        return $response->json()['tasks'][0] ?? null;
    }

    private function extractBestRanked(array $items, string $projectUrl): ?array
    {
        return collect($items)
            ->filter(fn($item) =>
                isset($item['url'], $item['rank_group']) &&
                str_contains($item['url'], $projectUrl)
            )
            ->sortBy('rank_group')
            ->first();
    }

    private function storeResult(int $taskId, array $data): DataForSeoResult
    {
        return DataForSeoResult::create([
            'data_for_seo_task_id' => $taskId,
            'type'                 => $data['type'] ?? null,
            'rank_group'           => $data['rank_group'] ?? null,
            'rank_absolute'        => $data['rank_absolute'] ?? null,
            'domain'               => $data['domain'] ?? null,
            'title'                => $data['title'] ?? null,
            'description'          => $data['description'] ?? null,
            'url'                  => $data['url'] ?? null,
            'breadcrumb'           => $data['breadcrumb'] ?? null,
        ]);
    }

    private function processTasks(Collection $tasks, string $projectUrl, array $credentials): Collection
    {
        $results = collect();

        foreach ($tasks as $task) {
            $taskData = $this->fetchTaskResult($task->task_id, $credentials);

            if (!$taskData) {
                continue;
            }

            $items = $taskData['result'][0]['items'] ?? [];
            $bestRanked = $this->extractBestRanked($items, $projectUrl);


            if ($bestRanked) {
                $results->push($this->storeResult($task->id, $bestRanked));
//                $task->update(['status' => 'Completed']);
            }

            sleep(1); // API rate limit
        }

        return $results;
    }
}
