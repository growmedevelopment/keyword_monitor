<?php

namespace App\Jobs;

use App\Enums\DataForSeoTaskStatus;
use App\Models\DataForSeoTask;
use App\Services\DataForSeoResultService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PollDataForSeoTaskJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $taskId;
    public int $attemptCount;

    public function __construct(int $taskId, int $attemptCount = 0)
    {
        $this->taskId = $taskId;
        $this->attemptCount = $attemptCount;
    }


    /**
     * Handle the polling job for a DataForSEO task.
     *
     * This method retrieves the task by its ID, checks its status, and polls the
     * DataForSEO API via the service. If the task is not yet ready, it re-dispatches
     * itself with a delay until either results are obtained or the maximum retry
     * count is reached. If polling fails or max retries are exceeded, the task is
     * marked as `Failed`.
     *
     * @param DataForSeoResultService $service  The service responsible for polling DataForSEO results.
     *
     * @return void
     */
    public function handle(DataForSeoResultService $service): void
    {
        $task = DataForSeoTask::find($this->taskId);

        if (!$task || $task->status === DataForSeoTaskStatus::COMPLETED) {
            return;
        }

        try {
            $ready = $service->pollSingleTask($task, true);

            if (!$ready) {
                $this->attemptCount++;

                $maxRetries = config('dataforseo.polling.max_retries');
                $subsequentDelay = config('dataforseo.polling.subsequent_delay');
                $backoffFactor = config('dataforseo.polling.backoff_factor');

                if ($this->attemptCount >= $maxRetries) {
                    $task->update(['status' => DataForSeoTaskStatus::FAILED]);
                    $this->fail(new \Exception("Task {$this->taskId} exceeded max retries."));
                    return;
                }


                $totalElapsed = $this->attemptCount * $subsequentDelay; // approx elapsed time

                if ($totalElapsed < 120) {
                    // Fast polling: every 5 seconds for first 2 minutes
                    $delay = 5;
                } else {
                    // Switch to exponential backoff
                    $delay = min($subsequentDelay * ($backoffFactor ** ($this->attemptCount - 1)), 60);
                }
                Log::info("[DataForSEO] Retry scheduled", [
                    'task_id' => $this->taskId,
                    'attempt' => $this->attemptCount,
                    'next_delay' => $delay
                ]);


                self::dispatch($this->taskId, $this->attemptCount)
                    ->delay(now()->addSeconds($delay));
            }
        } catch (\Throwable $e) {
            \Log::error("Polling failed for Task {$this->taskId}: {$e->getMessage()}");
            $task->update(['status' => DataForSeoTaskStatus::FAILED]);
        }
    }
}
