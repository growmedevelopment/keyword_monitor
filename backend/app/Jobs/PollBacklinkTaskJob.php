<?php

namespace App\Jobs;

use App\Enums\DataForSeoTaskStatus;
use App\Models\BacklinkTask;
use App\Models\BacklinkCheck;
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

    public BacklinkTask $task;

    public function __construct(BacklinkTask $task)
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

            if ( in_array($status, [
                DataForSeoTaskStatus::PROCESSING,
                DataForSeoTaskStatus::QUEUED
            ], true) ) {
                Log::info("Backlink task still pending – retrying", [
                    'task_id' => $this->task->task_id,
                    'status_code' => $status
                ]);

                self::dispatch($this->task)->delay(now()->addSeconds(10));
                return;
            }

            // final update
            $this->task->update([
                'status_code' => $taskData['status_code'],
                'status_message' => $taskData['status_message'],
                'completed_at' => now(),
                'raw_response' => json_encode($taskData)
            ]);

            $items = $taskData['result'][0]['items'] ?? [];

            if (empty($items)) {
                Log::warning("SERP result empty", [
                    'task_id' => $this->task->task_id
                ]);
                return;
            }

            $result = collect($items)->sortBy('rank_group')->first();

            BacklinkCheck::create([
                'backlink_target_id' => $this->task->backlink_target_id,
                'url' => $result['url'] ?? null,
                'indexed' => ($result['rank_group'] ?? 0) > 0,
                'status_code' => $result['rank_group'] ?? null,
                'raw' => json_encode($result, JSON_THROW_ON_ERROR),
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
}
