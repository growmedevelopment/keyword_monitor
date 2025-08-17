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

        Log::info("✅ Done for Keyword ID {$keyword->id}");
    }
}
