<?php

namespace App\Jobs;

use App\Models\Keyword;
use App\Services\DataForSeo\CredentialsService;
use App\Services\DataForSeoResultService;
use App\Services\KeywordSubmissionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessDailyKeywordRanksJob implements ShouldQueue {

    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(DataForSeoResultService $seoService, KeywordSubmissionService $submissionService): void {
        $startTime = now();
        Log::info("🔄 ProcessDailyKeywordRanksJob started at: {$startTime}");

        $totalProcessed = 0;
        $totalSkipped = 0;
        $totalFailed = 0;

        Keyword::with('project')
            ->where('is_active', 1)
            ->chunk(
                100,
                function($keywords) use (
                    $seoService,
                    $submissionService,
                    $totalProcessed,
                    $totalSkipped,
                    $totalFailed
                ) {
                    foreach ( $keywords as $keyword ) {
                        try {
                            $totalProcessed++;

                            if ( $keyword->last_submitted_at && $keyword->last_submitted_at->isToday() ) {
                                $totalSkipped++;
                                Log::info("⏭️ Skipped Keyword ID {$keyword->id} — already submitted today.");
                                continue;
                            }

                            Log::info(
                                "🚀 Processing Keyword ID {$keyword->id} ({$keyword->keyword}) for Project ID {$keyword->project_id}"
                            );

                            $payload = $submissionService->buildPayload($keyword, $keyword->project);
                            $credentials = CredentialsService::get();

                            Log::debug("📦 Payload for Keyword ID {$keyword->id}: " . json_encode($payload));
                            Log::debug("🔐 Credentials used: " . json_encode($credentials));

                            $submissionService->submitToDataForSeo($payload, $keyword, $keyword->project, $credentials);
                            Log::info("✅ Submitted Keyword ID {$keyword->id} to DataForSEO");

                            $seoService->fetchSEOResultsByKeyword($keyword);
                            Log::info("📊 Fetched SEO results for Keyword ID {$keyword->id}");

                            $keyword->update(['last_submitted_at' => now()]);
                            Log::info("🕒 Updated last_submitted_at for Keyword ID {$keyword->id}");
                        }
                        catch ( \Throwable $e ) {
                            $totalFailed++;
                            Log::error("❌ Keyword Rank Job failed for Keyword ID {$keyword->id}: {$e->getMessage()}");
                            Log::debug($e->getTraceAsString());
                        }
                    }
                }
            );

        $endTime = now();
        Log::info("🏁 ProcessDailyKeywordRanksJob completed at: {$endTime}");
        Log::info("📊 Summary — Processed: {$totalProcessed}, Skipped: {$totalSkipped}, Failed: {$totalFailed}");
    }

    public function failed(Throwable $exception): void
    {
        Log::critical('ProcessDailyKeywordRanksJob failed: ' . $exception->getMessage());
    }
}
