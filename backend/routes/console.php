<?php

use App\Jobs\ProcessDailyKeywordRanksJob;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Keyword Rank Job (Twice Monthly)
|--------------------------------------------------------------------------
*/

Schedule::call(static function (): void {
    ProcessDailyKeywordRanksJob::dispatch();
})
    ->twiceMonthly(1, 16, '01:00')
    ->timezone('America/Edmonton')
    ->name('keyword-rank-job')
    ->onSuccess(static fn () => info('[Scheduler] Keyword rank job dispatched'));

/*
|--------------------------------------------------------------------------
| Laravel Telescope Pruning (Weekly Retention)
|--------------------------------------------------------------------------
*/

Schedule::command('telescope:prune --hours=48')
    ->daily()
    ->timezone('America/Edmonton')
    ->name('telescope-prune')
    ->onSuccess(static fn () => info('[Scheduler] Telescope pruned successfully'))
    ->onFailure(static fn () => warning('[Scheduler] Telescope prune failed'));
