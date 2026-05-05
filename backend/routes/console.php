<?php

use App\Jobs\FetchReadySearchVolumeTasksJob;
use App\Jobs\FetchReadySerpTasksJob;
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

Schedule::job(new FetchReadySerpTasksJob)
    ->everyMinute()
    ->timezone('America/Edmonton')
    ->name('dataforseo-serp-tasks-ready');

Schedule::job(new FetchReadySearchVolumeTasksJob)
    ->everyMinute()
    ->timezone('America/Edmonton')
    ->name('dataforseo-search-volume-tasks-ready');

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
