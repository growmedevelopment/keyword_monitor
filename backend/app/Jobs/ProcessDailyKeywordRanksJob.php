<?php

namespace App\Jobs;

use App\Models\Keyword;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ProcessDailyKeywordRanksJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $startTime = now();
        Log::info("🔄 Daily keyword rank job started at: {$startTime}");

        $processed = 0;
        $skipped = 0;

        Keyword::with('project')
            ->where('is_active', 1)
            ->whereHas('project', function ($q) {
                $q->whereNull('deleted_at');
            })
            ->chunk(100, function ($keywords) use (&$processed, &$skipped) {
                foreach ($keywords as $keyword) {
                    if ($keyword->last_submitted_at && $keyword->last_submitted_at->isToday()) {
                        $skipped++;
                        Log::info("⏭️ Skipped Keyword ID {$keyword->id} — already submitted today.");
                        continue;
                    }

                    dispatch(new ProcessSingleKeywordJob($keyword, false));
                    $processed++;

                    Log::info("🚀 Queued submission job for Keyword ID {$keyword->id} ({$keyword->keyword})");
                }
            });

        $endTime = now();
        Log::info("🏁 ProcessDailyKeywordRanksJob finished at: {$endTime}");
        Log::info("📊 Summary — Processed: {$processed}, Skipped: {$skipped}");
    }
}
