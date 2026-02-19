<?php

namespace App\Observers;

use App\Enums\DataForSeoTaskStatus;
use App\Jobs\PollDataForSeoTaskJob;
use App\Jobs\PollSearchValueTaskJob;
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

        // Identify the task type by its raw_response or some other field
        // Keyword tasks have 'keyword' in data. Search volume tasks have 'keywords' (plural).
        $raw = json_decode($task->raw_response, true);

        if (isset($raw['data']['keywords'])) {
            PollSearchValueTaskJob::dispatch($task)->delay(now()->addSeconds($delaySeconds));
            return;
        }

        PollDataForSeoTaskJob::dispatch($task, [
            'username' => config('services.dataforseo.username'),
            'password' => config('services.dataforseo.password'),
        ])->delay(now()->addSeconds($delaySeconds));
    }
}
