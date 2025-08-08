<?php

use App\Events\TestBroadcastEvent;
use App\Jobs\ProcessDailyKeywordRanksJob;
use App\Jobs\TestJob;
use Illuminate\Support\Facades\Route;


// 🔊 Test broadcasting with Soketi
Route::get('/broadcast-test', function () {
    broadcast(new TestBroadcastEvent('Hello from Laravel + Soketi!'));
    return 'Event broadcasted!';
});

// 🚀 Job trigger: Daily keyword rank processing
Route::get('/run-keyword-job', function () {
    ProcessDailyKeywordRanksJob::dispatch();

    return response()->json([
        'message' => '✅ Keyword rank job dispatched successfully!',
    ]);
});

// 🧪 Job trigger: Simple test job
Route::get('/run-test-job', function () {
    TestJob::dispatch();

    return response()->json([
        'message' => '✅ TestJob dispatched successfully!',
    ]);
});
