<?php

namespace App\Jobs;

use App\Models\DataForSeoTask;
use App\Services\DataForSeoResultService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

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

    public function handle(DataForSeoResultService $service): void
    {
        $task = DataForSeoTask::find($this->taskId);

        // Stop if missing or already completed
        if (!$task || $task->status === 'Completed') {
            return;
        }

        // Non-blocking poll
        $ready = $service->pollSingleTask($task, true);

        if (!$ready) {
            $this->attemptCount++;

            if ($this->attemptCount >= DataForSeoResultService::MAX_RETRIES) {
                // Mark as failed if still no results
                $task->update(['status' => 'Failed']);
                return;
            }

            // Re-dispatch with delay
            self::dispatch($this->taskId, $this->attemptCount)
                ->delay(now()->addSeconds(DataForSeoResultService::SUBSEQUENT_DELAY));
        }
    }
}
