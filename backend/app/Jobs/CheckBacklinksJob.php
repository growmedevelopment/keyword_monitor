<?php

namespace App\Jobs;

use App\Models\LinkTarget;
use App\Services\LinkService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckBacklinksJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(LinkService $backlinkService): void
    {
        Log::info('Starting weekly backlink re-check job.');

        $targets = LinkTarget::all();

        foreach ($targets as $target) {
            try {
                $backlinkService->checkBacklink($target);
            } catch (\Exception $e) {
                Log::error("Failed to trigger check for backlink target ID: {$target->id}", [
                    'error' => $e->getMessage()
                ]);
            }
        }

        Log::info('Weekly backlink re-check job finished.');
    }
}
