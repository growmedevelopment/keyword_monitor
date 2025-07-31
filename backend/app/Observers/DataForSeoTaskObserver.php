<?php

namespace App\Observers;

use App\Enums\DataForSeoTaskStatus;
use App\Jobs\PollDataForSeoTaskJob;
use App\Models\DataForSeoTask;
use App\Services\DataForSeoResultService;

class DataForSeoTaskObserver
{
    public function created(DataForSeoTask $task): void
    {
        // Only trigger polling for Submitted tasks
        if ($task->status === DataForSeoTaskStatus::SUBMITTED) {
            $service = app(DataForSeoResultService::class);

            // Try immediate fetch first (blocking, short retries)
            $immediateResult = $service->fetchSEOResultsByKeyword($task->keyword);

            if ($immediateResult->isEmpty()) {
                // Queue non-blocking polling
                $initialDelay = config('dataforseo.polling.initial_delay');
                PollDataForSeoTaskJob::dispatch($task->id)
                    ->delay(now()->addSeconds($initialDelay));
            }
        }
    }
}
