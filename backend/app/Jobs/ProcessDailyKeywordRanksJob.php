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

class ProcessDailyKeywordRanksJob implements ShouldQueue {

    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(DataForSeoResultService $seoService, KeywordSubmissionService $submissionService): void {
        dd('hello');
    }

}
