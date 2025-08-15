<?php

namespace App\Services;

use App\Models\Keyword;
use App\Models\DataForSeoResult;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Events\KeywordUpdatedEvent;

class DataForSeoResultService
{

    public function fetchResults(Keyword $keyword): ?array
    {
        sleep(15); // Delay before polling

        $credentials = [
            'username' => config('services.dataforseo.username'),
            'password' => config('services.dataforseo.password'),
        ];

        $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
            ->get("https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/{$keyword->task->task_id}");

        $json = $response->json();

        Log::info('DataForSEO result response', ['response' => $json]);

        if (!isset($json['tasks'][0]['result'][0]['items'][0])) {
            Log::warning('No result data found for task', ['task_id' => $keyword->task->task_id]);
            return null;
        }

        return $json['tasks'][0]['result'][0]['items'] ?? [];
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
            'type' => $resultData['type'] ?? null,
            'rank_group' => $resultData['rank_group'] ?? null,
            'rank_absolute' => $resultData['rank_absolute'] ?? null,
            'domain' => $resultData['domain'] ?? null,
            'url' => $resultData['url'] ?? null,
            'title' => $resultData['title'] ?? null,
        ]);

        broadcast(new KeywordUpdatedEvent($task, $result));
    }






    private function log(string $level, string $message, array $context = []): void
    {
        Log::$level('[DataForSEO] ' . $message, $context);
    }
}
