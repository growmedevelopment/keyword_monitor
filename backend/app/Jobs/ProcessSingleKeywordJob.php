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

class ProcessSingleKeywordJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Keyword $keyword;

    public function __construct(Keyword $keyword)
    {
        $this->keyword = $keyword;
    }

    public function handle(
        DataForSeoResultService $seoService,
        KeywordSubmissionService $submissionService
    ): void {
        $keyword = $this->keyword;

        if ($keyword->last_submitted_at && $keyword->last_submitted_at->isToday()) {
            Log::info("⏭️ Skipped Keyword ID {$keyword->id} — already submitted today.");
            return;
        }

        Log::info("🚀 Processing Keyword ID {$keyword->id} ({$keyword->keyword})");

        $payload = $submissionService->buildPayload($keyword, $keyword->project);
        $credentials = CredentialsService::get();

        $submissionService->submitToDataForSeo($payload, $keyword, $keyword->project, $credentials);

        $taskData = $seoService->fetchResults($keyword);

        if (!$taskData) {
            Log::warning("⚠️ No task result yet — will retry for Keyword ID {$keyword->id}");
            self::dispatch($keyword)->delay(now()->addSeconds(20));
            return;
        }

        $seoService->storeResults($keyword, $taskData);
        $keyword->update(['last_submitted_at' => now()]);

        Log::info("✅ Done for Keyword ID {$keyword->id}");
    }
}
