<?php

namespace App\Jobs;

use App\Events\KeywordUpdatedEvent;
use App\Models\DataForSeoResult;
use App\Models\DataForSeoTask;
use App\Models\KeywordRank;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;


class PollDataForSeoTaskJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected DataForSeoTask $task;

    public function __construct(DataForSeoTask $task)
    {
        $this->task = $task;
    }

    public function handle(): void
    {
        sleep(15); // Initial wait before polling

        try {
            $credentials = [
                'username' => config('services.dataforseo.username'),
                'password' => config('services.dataforseo.password'),
            ];

            Log::info('task', [
                 'task'=> $this->task,
            ]);

            $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
                ->get("https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/{$this->task->task_id}");

            $json = $response->json();

            Log::info('DataForSEO result response', ['response' => $json]);

            if (!isset($json['tasks'][0]['result'][0])) {
                Log::warning('No result data found for task', ['task_id' => $this->task->task_id]);
                return;
            }

            $taskData = $json['tasks'][0];
            $projectHost = $this->task->keyword->project->url;
            $items = $taskData['result'][0]['items'] ?? [];
            $resultData = filterDataForSeoItemsByHost($items, $projectHost);


            if (!$resultData) {
                Log::warning('No items found in result', ['task_id' => $this->task->task_id]);
                return;
            }

            // Update task status and store raw response
            $this->task->update([
                'status_message' => $taskData['status_message'],
                'status_code' => $taskData['status_code'],
                'completed_at' => now(),
                'raw_response' => json_encode($taskData, JSON_THROW_ON_ERROR),
            ]);

            // Save result
            $result = DataForSeoResult::create([
                'data_for_seo_task_id' => $this->task->id,
                'type' => $resultData['type'],
                'rank_group' => $resultData['rank_group'],
                'rank_absolute' => $resultData['rank_absolute'],
                'domain' => $resultData['domain'] ,
                'url' => $resultData['url'],
                'title' => $resultData['title'],
            ]);

            KeywordRank::create([
                'keyword_id' => $this->task->keyword_id,
                'position' => $resultData['rank_group'],
                'url' => $resultData['url'],
                'raw' => $resultData,
                'tracked_at' => now()->toDateString(),
            ]);

            // Notify frontend
            broadcast(new KeywordUpdatedEvent($this->task, $result));

        } catch (\Throwable $e) {
            Log::error('Failed to fetch DataForSEO result', [
                'task_id' => $this->task->task_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
