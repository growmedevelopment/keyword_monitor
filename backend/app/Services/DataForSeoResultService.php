<?php

namespace App\Services;

use App\Http\Resources\ProjectViewResource;
use App\Jobs\PollDataForSeoTaskJob;
use App\Models\DataForSeoTask;
use App\Models\Keyword;
use App\Models\DataForSeoResult;
use App\Models\KeywordRank;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DataForSeoResultService
{
    public const INITIAL_DELAY = 3;
    public const SUBSEQUENT_DELAY = 10;
    public const MAX_RETRIES = 30;


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

    private function fetchTaskResult(string $taskId, array $credentials): array
    {
        $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
            ->get("https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/{$taskId}");

        $json = $response->json();

        Log::info('Polling DataForSEO task result', [
            'task_id' => $taskId,
            'response' => $json,
        ]);

        if (!$response->successful()) {
            Log::warning('Failed to fetch DataForSEO task result', [
                'task_id' => $taskId,
                'status'  => $response->status(),
                'body'    => $response->body(),
            ]);
            return [];
        }

        return $json['tasks'][0]['result'][0]['items'] ?? [];
    }

    private function extractBestRanked(array $items, string $projectUrl): ?array
    {
        Log::info('Extracting best ranked', [
            'project_url' => $projectUrl,
            'items_count' => count($items),
            'first_item_url' => $items[0]['url'] ?? null
        ]);

        $projectHost = parse_url($projectUrl, PHP_URL_HOST);

        return collect($items)
            ->filter(function ($item) use ($projectHost) {
                return isset($item['url'], $item['rank_group']) &&
                    parse_url($item['url'], PHP_URL_HOST) === $projectHost;
            })
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
            // Immediate single attempt (no retry loop)
            $items = $this->fetchTaskResult($task->task_id, $credentials);

            if (!empty($items)) {
                $bestRanked = $this->extractBestRanked($items, $projectUrl);
                if ($bestRanked) {
                    $results->push($this->saveResults($task, $bestRanked));
                    continue;
                }
            }

            // Queue for async polling
            PollDataForSeoTaskJob::dispatch($task->id)->delay(now()->addSeconds(self::INITIAL_DELAY));
            $task->update(['status' => 'Queued']);
        }

        return $results;
    }

    public function pollSingleTask(DataForSeoTask $task, bool $nonBlocking = false): bool
    {
        $credentials = $this->getCredentials();
        $projectUrl  = $task->keyword->project->url;

        $items = $this->fetchTaskResult($task->task_id, $credentials);

        if (!empty($items)) {
            $bestRanked = $this->extractBestRanked($items, $projectUrl);

            if ($bestRanked) {
                $this->saveResults($task, $bestRanked);
                return true;
            }
        }

        return false;
    }

    private function storeKeywordRank(DataForSeoTask $task, array $bestRanked): void {

        KeywordRank::create([
            'keyword_id' => $task->keyword_id,
            'position' => $bestRanked['rank_group'] ?? NULL,
            'url' => $bestRanked['url'] ?? NULL,
            'raw' => $bestRanked, // store full API item
            'tracked_at' => now()->toDateString(),
        ]);
    }

    private function saveResults(DataForSeoTask $task, array $bestRanked): DataForSeoResult
    {
        Log::info('saveResults', [$bestRanked]);
        $result = $this->storeResult($task->id, $bestRanked);
        $this->storeKeywordRank($task, $bestRanked);
        $task->update([
            'status' => 'Completed',
            'completed_at' => now()->toDateString(),
         ]);
        return $result;
    }
}
