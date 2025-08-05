<?php

namespace App\Events;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TestBroadcastEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $message;

    public function __construct($message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): Channel {
        return new Channel('test-channel');
    }

    public function broadcastAs(): string {
        return 'test-event';
    }
}
