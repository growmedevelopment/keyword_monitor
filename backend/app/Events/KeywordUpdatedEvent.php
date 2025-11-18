<?php

namespace App\Events;

use App\Models\DataForSeoResult;
use App\Models\DataForSeoTask;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class KeywordUpdatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public DataForSeoTask $task;
    public DataForSeoResult $result;

    public function __construct(DataForSeoTask $task, DataForSeoResult $result)
    {
        $this->task = $task;
        $this->result = $result;

        Log::info('🔔 KeywordUpdatedEvent fired', [
            'task_id'     => $task->id,
            'keyword_id'  => $task->keyword_id,
            'project_id'  => $task->project_id,
            'result_type' => $result->type,
        ]);
    }

    public function broadcastOn(): Channel
    {
        return new Channel('project-' . $this->task->project_id);
    }
}
