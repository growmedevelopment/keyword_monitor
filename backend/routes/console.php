<?php

use App\Jobs\ProcessDailyKeywordRanksJob;
use Illuminate\Support\Facades\Schedule;

Schedule::call(static function () {
    ProcessDailyKeywordRanksJob::dispatch();
})
    ->dailyAt('01:00')
    ->timezone('America/Edmonton')
    ->name('daily-keyword-rank-job')
    ->onSuccess(fn () => info('[Scheduler] Keyword rank job dispatched to queue'))
    ->onFailure(fn () => info('[Scheduler] Keyword rank job dispatch failed'));


Schedule::command('telescope:prune --hours=168')
    ->daily()
    ->timezone('America/Edmonton');
