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
        dump($this->keyword);
        dump($this->result);
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
                'id' => $this->keyword['id'],
                'keyword' => $this->keyword['keyword'],
                'status' => 'custom status',
                'results' => [
                    'type' => $this->result['type'],
                    'rank_group' => $this->result['rank_group'],
                    'rank_absolute' => $this->result['rank_absolute'],
                    'url' => $this->result['url'],
                    'title' => $this->result['title'],
                ],
            ],
        ];
    }
}
