<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Keyword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessDailyKeywordRanksJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function handle(): void
    {
        $startTime = now();
        Log::info("🔄 Daily keyword rank job started at: {$startTime}");

        $queued = 0;

        Keyword::query()
            ->where('is_active', true)
            ->where(function ($query) {
                $query
                    ->whereNull('last_submitted_at')
                    ->orWhereDate('last_submitted_at', '<', today());
            })
            ->whereHas('project', function ($query) {
                $query->whereNull('deleted_at');
            })
            ->chunkById(100, function ($keywords) use (&$queued): void {
                $keywordIds = $keywords->modelKeys();
                ProcessKeywordSubmissionChunkJob::dispatchForKeywordIds($keywordIds, false);

                $queued += count($keywordIds);

                Log::info('Queued keyword submission chunk jobs for daily refresh.', [
                    'keyword_count' => count($keywordIds),
                ]);
            });

        $endTime = now();
        Log::info("🏁 ProcessDailyKeywordRanksJob finished at: {$endTime}");
        Log::info("📊 Summary — Queued: {$queued}");
    }
}
