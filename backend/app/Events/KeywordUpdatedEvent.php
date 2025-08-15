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

    public function broadcastAs(): string
    {
        return 'keyword-updated';
    }

    public function broadcastWith(): array
    {
        $keyword = $this->task->keyword;

        return [
            'keyword' => [
                'id'             => $keyword->id,
                'keyword'        => $keyword->keyword,
                'status_message' => $this->task->status_message,
                'status_code'    => $this->task->status_code,
                'results'        => [
                    'type'          => $this->result->type,
                    'rank_group'    => $this->result->rank_group,
                    'rank_absolute' => $this->result->rank_absolute,
                    'url'           => $this->result->url,
                    'title'         => $this->result->title,
                ],
            ],
        ];
    }
}
