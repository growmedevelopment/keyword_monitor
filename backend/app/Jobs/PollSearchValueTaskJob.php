<?php

namespace App\Jobs;

use App\Enums\DataForSeoTaskStatus;
use App\Models\DataForSeoTask;
use App\Services\SearchValueService;
use App\Services\DataForSeo\CredentialsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PollSearchValueTaskJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected DataForSeoTask $task;

    /**
     * Create a new job instance.
     *
     * @param DataForSeoTask $task
     */
    public function __construct(DataForSeoTask $task)
    {
        $this->task = $task;
    }

    /**
     * Execute the job.
     */
    public function handle(SearchValueService $searchValueService): void
    {
        try {
            $credentials = CredentialsService::get();

            Log::info('Polling DataForSEO Search Value task', ['task_id' => $this->task->task_id]);

            $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
                ->get("https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_get/{$this->task->task_id}");

            $json = $response->json();

            Log::info('DataForSEO Search Value result response', ['response' => $json]);

            // If we get a 40400 Not Found, it might be that the task is still being initialized
            if (isset($json['status_code']) && (int) $json['status_code'] === 40400) {
                Log::info('Search Value task not found yet (40400), retrying...', ['task_id' => $this->task->task_id]);

                $attempts = Cache::increment("search_value_retries:{$this->task->task_id}");
                if ($attempts <= 30) {
                    self::dispatch($this->task)->delay(now()->addSeconds(20));
                } else {
                    Log::warning('Max retries reached for Search Value task (40400)', ['task_id' => $this->task->task_id]);
                    Cache::forget("search_value_retries:{$this->task->task_id}");
                }
                return;
            }

            if (!$response->successful() || !isset($json['tasks'][0])) {
                Log::warning('Invalid DataForSEO Search Value response', [
                    'task_id' => $this->task->task_id,
                    'response' => $json,
                ]);
                return;
            }

            $taskData = $json['tasks'][0];

            // Update task status in DB
            $this->task->update([
                'status_message' => $taskData['status_message'] ?? $this->task->status_message,
                'status_code' => $taskData['status_code'] ?? $this->task->status_code,
            ]);

            // Handle "Task In Queue" or "Processing" response
            if ((int) $taskData['status_code'] === DataForSeoTaskStatus::QUEUED || (int) $taskData['status_code'] === DataForSeoTaskStatus::PROCESSING) {
                Log::info('Search Value task still in queue/processing, retrying...', ['task_id' => $this->task->task_id]);

                $attempts = Cache::increment("search_value_retries:{$this->task->task_id}");
                if ($attempts <= 30) { // Up to 10 minutes if polling every 20s
                    self::dispatch($this->task)->delay(now()->addSeconds(20));
                } else {
                    Log::warning('Max retries reached for Search Value task', ['task_id' => $this->task->task_id]);
                    Cache::forget("search_value_retries:{$this->task->task_id}");
                }

                return;
            }

            if ((int) $taskData['status_code'] === DataForSeoTaskStatus::COMPLETED && isset($taskData['result'][0])) {
                // Clear retry count on success
                Cache::forget("search_value_retries:{$this->task->task_id}");

                $result = $taskData['result'][0];

                // Update SearchValue via service
                $searchValueService->updateOrCreateForKeyword($this->task->keyword, [
                    'search_volume' => $result['search_volume'] ?? null,
                    'cpc' => $result['cpc'] ?? null,
                    'competition' => $result['competition'] ?? null,
                    'competition_index' => $result['competition_index'] ?? null,
                    'low_top_of_page_bid' => $result['low_top_of_page_bid'] ?? null,
                    'high_top_of_page_bid' => $result['high_top_of_page_bid'] ?? null,
                    'search_partners' => $result['search_partners'] ?? false,
                ]);

                // Mark task as completed
                $this->task->update([
                    'completed_at' => now(),
                    'raw_response' => json_encode($taskData, JSON_THROW_ON_ERROR),
                ]);

                Log::info('Search Value task completed and updated.', ['task_id' => $this->task->task_id]);
            } else {
                Log::warning('Search Value task failed or returned no results', [
                    'task_id' => $this->task->task_id,
                    'status_code' => $taskData['status_code'],
                ]);
            }

        } catch (\Throwable $e) {
            Log::error('Failed to fetch DataForSEO Search Value result', [
                'task_id' => $this->task->task_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
