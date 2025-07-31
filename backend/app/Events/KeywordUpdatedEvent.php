<?php

namespace App\Events;

use App\Models\DataForSeoResult;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Keyword;
use Illuminate\Support\Facades\Log;

class KeywordUpdatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $keyword;
    public array $result;

    public function __construct(Keyword $keyword, DataForSeoResult $result)
    {
        $this->keyword = $keyword->toArray();
        $this->result = $result->toArray();

        // Log raw model info
        Log::info('KeywordUpdatedEvent triggered', [
            'keyword'    => $this->keyword['keyword'],
            'project_id' => $this->keyword['project_id'],
            'result'     => $this->result,
        ]);
    }

    public function broadcastOn(): Channel
    {
        return new Channel('project-' . $this->keyword['project_id']);
    }

    public function broadcastAs(): string
    {
        return 'keyword-updated';
    }

    public function broadcastWith(): array
    {
        return [
            'keyword' => [
                ...$this->keyword,
                'data_for_seo_results' => [$this->result],
            ],
        ];
    }
}
