<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\DataForSeoTask;
use App\Services\DataForSeo\CredentialsService;
use App\Services\DataForSeoTaskResultProcessor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FetchReadySerpTasksJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function handle(DataForSeoTaskResultProcessor $taskResultProcessor): void
    {
        $credentials = CredentialsService::get();

        $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
            ->get('https://api.dataforseo.com/v3/serp/google/organic/tasks_ready');

        $json = $response->json();

        if (! $response->successful() || ! isset($json['tasks']) || ! is_array($json['tasks'])) {
            Log::warning('Invalid DataForSEO SERP tasks_ready response.', [
                'response' => $json,
            ]);

            return;
        }

        $readyTasks = collect($json['tasks'])
            ->flatMap(static fn (array $task): array => $task['result'] ?? [])
            ->filter(static fn (array $task): bool => isset($task['id'], $task['endpoint_regular']))
            ->values();

        if ($readyTasks->isEmpty()) {
            return;
        }

        $localTasks = DataForSeoTask::query()
            ->whereNull('completed_at')
            ->whereIn('task_id', $readyTasks->pluck('id'))
            ->get()
            ->keyBy('task_id');

        foreach ($readyTasks as $readyTask) {
            $localTask = $localTasks->get($readyTask['id']);

            if (! $localTask instanceof DataForSeoTask) {
                continue;
            }

            $taskResponse = Http::withBasicAuth($credentials['username'], $credentials['password'])
                ->get('https://api.dataforseo.com'.$readyTask['endpoint_regular']);

            $taskJson = $taskResponse->json();

            if (! $taskResponse->successful() || ! isset($taskJson['tasks'][0])) {
                Log::warning('Invalid SERP task_get response from DataForSEO.', [
                    'task_id' => $readyTask['id'],
                    'response' => $taskJson,
                ]);

                continue;
            }

            $taskResultProcessor->processSerpTaskData($localTask, $taskJson['tasks'][0]);
        }
    }
}
