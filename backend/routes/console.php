<?php

use App\Jobs\ProcessDailyKeywordRanksJob;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    ProcessDailyKeywordRanksJob::dispatch();
})
    ->dailyAt('01:00')
    ->timezone('America/Edmonton') // match your server/app timezone
    ->name('daily-keyword-rank-job')
    ->onSuccess(fn () => info('[Scheduler] Keyword rank job dispatched to queue'))
    ->onFailure(fn () => info('[Scheduler] Keyword rank job dispatch failed'));
