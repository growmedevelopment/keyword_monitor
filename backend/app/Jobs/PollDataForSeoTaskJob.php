<?php

namespace App\Jobs;

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

    public function handle(DataForSeoResultService $service): void
    {
        $task = DataForSeoTask::find($this->taskId);

        // Stop if task missing or already completed
        if (!$task || $task->status === 'Completed') {
            return;
        }

        $completed = $service->pollSingleTask($task, true);

        if (!$completed) {
            $this->attemptCount++;

            if ($this->attemptCount >= DataForSeoResultService::MAX_RETRIES) {
                $task->update(['status' => 'Failed']);
                Log::warning("Task {$this->taskId} failed after max retries.");
                return;
            }

            // Exponential backoff (3s, 10s, 20s, 40s…)
            $delay = DataForSeoResultService::SUBSEQUENT_DELAY * ($this->attemptCount + 1);

            // Re-dispatch with incremented attempt count
            self::dispatch($this->taskId, $this->attemptCount)
                ->delay(now()->addSeconds($delay));
        }
    }
}
