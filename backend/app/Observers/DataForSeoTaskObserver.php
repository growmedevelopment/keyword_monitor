<?php

namespace App\Observers;

use App\Enums\DataForSeoTaskStatus;
use App\Jobs\PollDataForSeoTaskJob;
use App\Models\DataForSeoTask;

class DataForSeoTaskObserver
{
    public function created(DataForSeoTask $task): void
    {
        // Proceed only if task was successfully submitted
        if ((int) $task->status_code !== DataForSeoTaskStatus::SUBMITTED) {
            return;
        }

        $this->queuePollingJob($task);
    }

    protected function queuePollingJob(DataForSeoTask $task): void
    {
        $delaySeconds = config('dataforseo.polling.initial_delay', 30);

        PollDataForSeoTaskJob::dispatch($task, [
            'username' => config('services.dataforseo.username'),
            'password' => config('services.dataforseo.password'),
        ])->delay(now()->addSeconds($delaySeconds));
    }
}
