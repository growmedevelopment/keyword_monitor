<?php

namespace App\Jobs;

use App\Enums\DataForSeoTaskStatus;
use App\Models\LinkTask;
use App\Models\LinkCheck;
use App\Events\BacklinkUpdatedEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class PollBacklinkTaskJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public LinkTask $task;

    public function __construct(LinkTask $task)
    {
        $this->task = $task;
    }

    public function handle(): void
    {
        sleep(8);

        try {
            $username = config('services.dataforseo.username');
            $password = config('services.dataforseo.password');

            $url = "https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/{$this->task->task_id}";

            $response = Http::withBasicAuth($username, $password)->get($url);
            $json = $response->json();

            Log::info("Backlink polling result", [
                'task_id' => $this->task->task_id,
                'json' => $json
            ]);

            $taskData = $json['tasks'][0] ?? null;
            if (!$taskData) {
                return;
            }

            $status = (int)$taskData['status_code'];

            if (in_array($status, [
                DataForSeoTaskStatus::PROCESSING,
                DataForSeoTaskStatus::QUEUED
            ], true)) {
                Log::info("Backlink task still pending – retrying", [
                    'task_id' => $this->task->task_id,
                    'status_code' => $status
                ]);

                self::dispatch($this->task)->delay(now()->addSeconds(10));
                return;
            }

            // Final update for the Task model
            $this->task->update([
                'status_code' => $taskData['status_code'],
                'status_message' => $taskData['status_message'],
                'completed_at' => now(),
                'raw_response' => json_encode($taskData)
            ]);

            // ---------------------------------------------------------
            // 1. INDEPENDENT HTTP CHECK
            // ---------------------------------------------------------
            // We extract the URL we were checking from the keyword (removing "site:")
            // This ensures we can check if the page is live even if Google hasn't indexed it.
            $targetUrl = str_replace('site:', '', $taskData['data']['keyword'] ?? '');

            // Use the URL from the model if the keyword parse fails, or fallback to null
            if (empty($targetUrl) && $this->task->target) {
                $targetUrl = $this->task->target->url;
            }

            $httpStatus = 0;

            if ($targetUrl) {
                try {
                    $pageResponse = Http::withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language' => 'en-US,en;q=0.5',
                        'Connection' => 'keep-alive',
                    ])
                        ->withOptions([
                            'verify' => false,
                            'allow_redirects' => true,
                        ])
                        ->timeout(15)
                        ->get($targetUrl);

                    $httpStatus = $pageResponse->status();

                } catch (\Throwable $e) {
                    // Log the actual error message to see if it's DNS, SSL, or Connection Reset
                    Log::error("HTTP Check Failed for $targetUrl", ['error' => $e->getMessage()]);
                }
            }

            // ---------------------------------------------------------
            // 2. CHECK GOOGLE INDEXING (SERP RESULTS)
            // ---------------------------------------------------------
            $items = $taskData['result'][0]['items'] ?? [];
            $result = null;

            if (empty($items)) {
                Log::warning("SERP result empty (Target not indexed)", [
                    'task_id' => $this->task->task_id,
                    'result'=>$result,
                ]);
                // Result remains null, indexed will be false
            } else {
                // Find the best match if items exist
                $result = collect($items)->sortBy('rank_group')->first();
            }



            // ---------------------------------------------------------
            // 3. CREATE CHECK RECORD
            // ---------------------------------------------------------
            LinkCheck::create([
                'backlink_target_id' => $this->task->backlink_target_id,
                'url' => $result['url'] ?? $targetUrl,
                'indexed' => ($result['rank_group'] ?? 0) > 0,
                'http_code' => $httpStatus, // This is now populated regardless of indexing
                'raw' => $result ? json_encode($result, JSON_THROW_ON_ERROR) : null,
                'checked_at' => now(),
            ]);

            $projectId = $this->task->target->project_id;
            event(new BacklinkUpdatedEvent($projectId));

        } catch (\Throwable $e) {
            Log::error("Backlink Polling Error", [
                'task_id' => $this->task->task_id,
                'error' => $e->getMessage()
            ]);
        }
    }

//    public function handle(): void
//    {
//
//        sleep(8);
//
//        try {
//            $username = config('services.dataforseo.username');
//            $password = config('services.dataforseo.password');
//
//            $url = "https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/{$this->task->task_id}";
//
//            $response = Http::withBasicAuth($username, $password)->get($url);
//            $json = $response->json();
//
//            Log::info("Backlink polling result", [
//                'task_id' => $this->task->task_id,
//                'json' => $json
//            ]);
//
//            $taskData = $json['tasks'][0] ?? null;
//            if (!$taskData) {
//                return;
//            }
//
//            $status = (int)$taskData['status_code'];
//
//            if ( in_array($status, [
//                DataForSeoTaskStatus::PROCESSING,
//                DataForSeoTaskStatus::QUEUED
//            ], true) ) {
//                Log::info("Backlink task still pending – retrying", [
//                    'task_id' => $this->task->task_id,
//                    'status_code' => $status
//                ]);
//
//                self::dispatch($this->task)->delay(now()->addSeconds(10));
//                return;
//            }
//
//            // final update
//            $this->task->update([
//                'status_code' => $taskData['status_code'],
//                'status_message' => $taskData['status_message'],
//                'completed_at' => now(),
//                'raw_response' => json_encode($taskData)
//            ]);
//
//            $items = $taskData['result'][0]['items'] ?? [];
//
//            if (empty($items)) {
//                Log::warning("SERP result empty", [
//                    'task_id' => $this->task->task_id
//                ]);
//                return;
//            }
//
//            $result = collect($items)->sortBy('rank_group')->first();
//            $pageUrl = $result['url'] ?? null;
//
//            if ($pageUrl) {
//                try {
//                    $pageResponse = Http::withHeaders([
//                        'User-Agent' => 'Mozilla/5.0',
//                    ])->get($pageUrl);
//
//                    $httpStatus = $pageResponse->status();
//
//                } catch (\Throwable $e) {
//                    $httpStatus = 0;
//                }
//            }
//
//            BacklinkCheck::create([
//                'backlink_target_id' => $this->task->backlink_target_id,
//                'url' => $result['url'] ?? null,
//                'indexed' => ($result['rank_group'] ?? 0) > 0,
//                'http_code' => $httpStatus,
//                'raw' => json_encode($result, JSON_THROW_ON_ERROR),
//                'checked_at' => now(),
//            ]);
//
//            $projectId = $this->task->target->project_id;
//
//            event(new BacklinkUpdatedEvent($projectId));
//
//        } catch (\Throwable $e) {
//            Log::error("Backlink Polling Error", [
//                'task_id' => $this->task->task_id,
//                'error' => $e->getMessage()
//            ]);
//        }
//    }
}
