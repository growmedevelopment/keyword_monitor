<?php

use App\Http\Controllers\DashboardController;

use App\Events\TestBroadcastEvent;

Route::get('/broadcast-test', function () {
    broadcast(new TestBroadcastEvent('Hello from Laravel + Soketi!'));
    return 'Event broadcasted!';
});
