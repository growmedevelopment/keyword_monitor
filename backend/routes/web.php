<?php

use App\Events\TestBroadcastEvent;
use App\Jobs\ProcessDailyKeywordRanksJob;
use App\Jobs\TestJob;

Route::get('/broadcast-test', function () {
    broadcast(new TestBroadcastEvent('Hello from Laravel + Soketi!'));
    return 'Event broadcasted!';
});


Route::get('/run-keyword-job', function () {
    ProcessDailyKeywordRanksJob::dispatch();

    return response()->json([
        'message' => '✅ Keyword rank job dispatched successfully!'
    ]);
});


Route::get('/run-test-job', function () {
    TestJob::dispatch();

    return response()->json([
        'message' => '✅ TestJob dispatched successfully!'
    ]);
});
