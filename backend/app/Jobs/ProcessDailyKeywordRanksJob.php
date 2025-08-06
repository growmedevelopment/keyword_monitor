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

class ProcessDailyKeywordRanksJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(DataForSeoResultService $seoService, KeywordSubmissionService $submissionService): void
    {
        Log::info('ProcessDailyKeywordRanksJob started at: ' . now());

        Keyword::with('project')
            ->where('is_active', 1)
            ->chunk(100, function ($keywords) use ($seoService, $submissionService) {
                foreach ($keywords as $keyword) {
                    try {
                        // Skip if already submitted today (prevent duplicates)
                        if ($keyword->last_submitted_at && $keyword->last_submitted_at->isToday()) {
                            continue;
                        }

                        // Build payload
                        $payload = $submissionService->buildPayload($keyword, $keyword->project);
                        $credentials = CredentialsService::get();

                        // Submit new task
                        $submissionService->submitToDataForSeo($payload, $keyword, $keyword->project, $credentials);

                        // Fetch latest results and store best rank
                        $seoService->fetchSEOResultsByKeyword($keyword);

                        // Mark as submitted
                        $keyword->update(['last_submitted_at' => now()]);

                    } catch (\Throwable $e) {
                        Log::error("Keyword Rank Job failed for Keyword ID {$keyword->id}: {$e->getMessage()}");
                    }
                }
            });
    }
}
