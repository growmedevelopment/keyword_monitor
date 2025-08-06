<?php


use App\Jobs\ProcessDailyKeywordRanksJob;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    ProcessDailyKeywordRanksJob::dispatch();
})
    ->everyMinute()
    ->name('daily-keyword-rank-job')
    ->onSuccess(fn () => info('[Scheduler] Keyword rank job dispatched to queue'))
    ->onFailure(fn () => info('[Scheduler] Keyword rank job dispatch failed'));
