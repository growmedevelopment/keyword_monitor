<?php

namespace App\Services;

use App\Enums\DataForSeoTaskStatus;
use App\Models\Keyword;
use App\Models\DataForSeoResult;
use App\Models\KeywordRank;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Events\KeywordUpdatedEvent;
use function filterDataForSeoItemsByHost;

class DataForSeoResultService
{
    public function fetchResults(Keyword $keyword): ?array
    {
        $credentials = [
            'username' => config('services.dataforseo.username'),
            'password' => config('services.dataforseo.password'),
        ];

        $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
            ->get("https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/{$keyword->task->task_id}");

        $json = $response->json();
        $task = $json['tasks'][0] ?? null;

        Log::info('DataForSEO fetch response', ['response' => $json]);

        $keyword->task->update([
            'status_message' => $task['status_message'],
            'status_code' => $task['status_code'],
        ]);

        if (!$task || (int) $task['status_code'] === DataForSeoTaskStatus::QUEUED) {
            return null; // Task still in queue
        }

        $items = $task['result'][0]['items'] ?? [];
        $matchedResult = filterDataForSeoItemsByHost($items, $keyword->project->url);

        return $matchedResult ? [
            'taskData' => $task,
            'resultData' => $matchedResult,
        ] : null;
    }

    public function storeResults(Keyword $keyword, array $data): void
    {
        $taskData = $data['taskData'];
        $resultData = $data['resultData'];
        $task = $keyword->task;

        $task->update([
            'status_message' => $taskData['status_message'],
            'status_code' => $taskData['status_code'],
            'completed_at' => now(),
            'raw_response' => json_encode($taskData, JSON_THROW_ON_ERROR),
        ]);

        $result = DataForSeoResult::create([
            'data_for_seo_task_id' => $task->id,
            'type' => $resultData['type'],
            'rank_group' => $resultData['rank_group'],
            'rank_absolute' => $resultData['rank_absolute'],
            'domain' => $resultData['domain'],
            'url' => $resultData['url'],
            'title' => $resultData['title'],
        ]);

        KeywordRank::create([
            'keyword_id' => $task->keyword_id,
            'position' => $resultData['rank_group'],
            'url' => $resultData['url'],
            'raw' => $resultData,
            'tracked_at' => now()->toDateString(),
        ]);

        broadcast(new KeywordUpdatedEvent($task, $result));
    }
}
