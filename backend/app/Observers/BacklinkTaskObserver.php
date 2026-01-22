<?php

namespace App\Observers;

use App\Models\LinkTask;
use App\Jobs\PollBacklinkTaskJob;
use Illuminate\Support\Facades\Log;

class BacklinkTaskObserver
{
    public function created(LinkTask $task): void
    {
        Log::info('BacklinkTaskObserver fired', [
            'task_id'     => $task->task_id,
            'status_code' => $task->status_code,
        ]);

        // Trigger polling ONLY when the DataForSEO task was created successfully.
        if ((int) $task->status_code === 20100) {
            $this->queuePolling($task);
        } else {
            Log::warning('Backlink task created but not successful (skipping polling)', [
                'status_code' => $task->status_code,
            ]);
        }
    }

    protected function queuePolling(LinkTask $task): void
    {
        $initialDelay = config('dataforseo.polling.initial_delay', 20);

        PollBacklinkTaskJob::dispatch($task)
            ->delay(now()->addSeconds($initialDelay));

        Log::info("Backlink polling job queued", [
            'task_id' => $task->task_id,
            'delay'   => $initialDelay,
        ]);
    }
}
