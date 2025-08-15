<?php

namespace App\Jobs;

use App\Enums\DataForSeoTaskStatus;
use App\Events\KeywordUpdatedEvent;
use App\Models\DataForSeoResult;
use App\Models\DataForSeoTask;
use App\Models\KeywordRank;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Cache;
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

            Log::info('Polling DataForSEO task', ['task_id' => $this->task->task_id]);

            $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
                ->get("https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/{$this->task->task_id}");

            $json = $response->json();

            Log::info('DataForSEO result response', ['response' => $json]);

            $this->task->update([
                'status_message' => $json['tasks'][0]['status_message'],
                'status_code' => $json['tasks'][0]['status_code'],
            ]);

            $taskData = $json['tasks'][0] ?? null;

            if (!$taskData) {
                Log::warning('No task data found in response', ['task_id' => $this->task->task_id]);
                return;
            }

            // Handle "Task In Queue" response
            if ((int) $taskData['status_code'] === DataForSeoTaskStatus::QUEUED) {
                Log::info('Task still in queue, retrying...', ['task_id' => $this->task->task_id]);

                $attempts = Cache::increment("seo_retries:{$this->task->task_id}");
                if ($attempts <= 5) {
                    self::dispatch($this->task)->delay(now()->addSeconds(10));
                } else {
                    Log::warning('Max retries reached for task', ['task_id' => $this->task->task_id]);
                }

                return;
            }

            if (!isset($taskData['result'][0])) {
                Log::warning('No result data found for task', ['task_id' => $this->task->task_id]);
                return;
            }

            // Clear retry count on success
            Cache::forget("seo_retries:{$this->task->task_id}");

            $projectHost = $this->task->keyword->project->url;
            $items = $taskData['result'][0]['items'] ?? [];
            $resultData = filterDataForSeoItemsByHost($items, $projectHost);

            if (!$resultData) {
                Log::warning('No matching SEO item found', ['task_id' => $this->task->task_id]);
                return;
            }

            // Update task with response
            $this->task->update([
                'status_message' => $taskData['status_message'],
                'status_code' => $taskData['status_code'],
                'completed_at' => now(),
                'raw_response' => json_encode($taskData, JSON_THROW_ON_ERROR),
            ]);

            // Store result
            $result = DataForSeoResult::create([
                'data_for_seo_task_id' => $this->task->id,
                'type' => $resultData['type'],
                'rank_group' => $resultData['rank_group'],
                'rank_absolute' => $resultData['rank_absolute'],
                'domain' => $resultData['domain'],
                'url' => $resultData['url'],
                'title' => $resultData['title'],
            ]);

            // Save keyword position
            KeywordRank::create([
                'keyword_id' => $this->task->keyword_id,
                'position' => $resultData['rank_group'],
                'url' => $resultData['url'],
                'raw' => $resultData,
                'tracked_at' => now()->toDateString(),
            ]);

            // Update keyword last_submitted_at
            $this->task->keyword->update(['last_submitted_at' => now()]);

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
