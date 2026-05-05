<?php

namespace App\Jobs;

use App\Enums\DataForSeoTaskStatus;
use App\Models\DataForSeoTask;
use App\Services\DataForSeoTaskResultProcessor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PollDataForSeoTaskJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected DataForSeoTask $task;

    public function __construct(DataForSeoTask $task)
    {
        $this->task = $task;
    }

    public function handle(DataForSeoTaskResultProcessor $taskResultProcessor): void
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

            // If we get a 40400 Not Found, it might be that the task is still being initialized
            if (isset($json['status_code']) && (int) $json['status_code'] === 40400) {
                Log::info('Task not found yet (40400), retrying...', ['task_id' => $this->task->task_id]);

                $attempts = Cache::increment("seo_retries:{$this->task->task_id}");
                if ($attempts <= 30) {
                    self::dispatch($this->task)->delay(now()->addSeconds(20));
                } else {
                    Log::warning('Max retries reached for task (40400)', ['task_id' => $this->task->task_id]);
                    Cache::forget("seo_retries:{$this->task->task_id}");
                }

                return;
            }

            $this->task->update([
                'status_message' => $json['tasks'][0]['status_message'],
                'status_code' => $json['tasks'][0]['status_code'],
            ]);

            $taskData = $json['tasks'][0] ?? null;

            if (! $taskData) {
                Log::warning('No task data found in response', ['task_id' => $this->task->task_id]);

                return;
            }

            // Handle "Task In Queue" response
            if ((int) $taskData['status_code'] === DataForSeoTaskStatus::QUEUED || (int) $taskData['status_code'] === DataForSeoTaskStatus::PROCESSING) {
                Log::info('Task still in queue, retrying...', ['task_id' => $this->task->task_id]);

                $attempts = Cache::increment("seo_retries:{$this->task->task_id}");
                if ($attempts <= 30) {
                    self::dispatch($this->task)->delay(now()->addSeconds(20));
                } else {
                    Log::warning('Max retries reached for task', ['task_id' => $this->task->task_id]);
                    Cache::forget("seo_retries:{$this->task->task_id}");
                }

                return;
            }

            if (! isset($taskData['result'][0])) {
                Log::warning('No result data found for task', ['task_id' => $this->task->task_id]);

                return;
            }

            // Clear retry count on success
            Cache::forget("seo_retries:{$this->task->task_id}");

            $taskResultProcessor->processSerpTaskData($this->task, $taskData);

        } catch (\Throwable $e) {
            Log::error('Failed to fetch DataForSEO result', [
                'task_id' => $this->task->task_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
