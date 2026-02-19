<?php

namespace App\Jobs;

use App\Models\Keyword;
use App\Services\DataForSeo\CredentialsService;
use App\Services\KeywordSubmissionService;
use App\Services\SearchValueService;
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

    public function handle(KeywordSubmissionService $submissionService, SearchValueService $searchValueService): void {
        $keyword = $this->keyword;

        if ($keyword->last_submitted_at && $keyword->last_submitted_at->isToday()) {
            Log::info("⏭️ Skipped Keyword ID {$keyword->id} — already submitted today.");
            return;
        }

        Log::info("🚀 Processing Keyword ID {$keyword->id} ({$keyword->keyword})");

        $payload = $submissionService->buildPayload($keyword, $keyword->project);
        $credentials = CredentialsService::get();

        $submissionService->submitToDataForSeo($payload, $keyword, $keyword->project, $credentials);

        // Also submit task for search volume
        $searchValueService->createTaskForKeyword($keyword);

        Log::info("✅ Done for Keyword ID {$keyword->id}");
    }
}
