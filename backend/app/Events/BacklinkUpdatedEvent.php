<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class BacklinkUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public int $projectId;

    public function __construct(int $projectId)
    {
        $this->projectId = $projectId;
    }

    public function broadcastOn(): Channel
    {
        return new Channel("backlinks.{$this->projectId}");
    }

    public function broadcastAs(): string
    {
        return "backlink-updated";
    }
}
