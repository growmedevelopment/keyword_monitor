<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\DataForSeoTask;
use App\Services\DataForSeo\CredentialsService;
use App\Services\DataForSeoTaskResultProcessor;
use App\Services\SearchValueService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FetchReadySearchVolumeTasksJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function handle(
        SearchValueService $searchValueService,
        DataForSeoTaskResultProcessor $taskResultProcessor,
    ): void {
        $credentials = CredentialsService::get();

        $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
            ->get('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/tasks_ready');

        $json = $response->json();

        if (! $response->successful() || ! isset($json['tasks']) || ! is_array($json['tasks'])) {
            Log::warning('Invalid DataForSEO search volume tasks_ready response.', [
                'response' => $json,
            ]);

            return;
        }

        $readyTasks = collect($json['tasks'])
            ->flatMap(static fn (array $task): array => $task['result'] ?? [])
            ->filter(static fn (array $task): bool => isset($task['id'], $task['endpoint']))
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
                ->get('https://api.dataforseo.com'.$readyTask['endpoint']);

            $taskJson = $taskResponse->json();

            if (! $taskResponse->successful() || ! isset($taskJson['tasks'][0])) {
                Log::warning('Invalid search volume task_get response from DataForSEO.', [
                    'task_id' => $readyTask['id'],
                    'response' => $taskJson,
                ]);

                continue;
            }

            $taskResultProcessor->processSearchVolumeTaskData(
                task: $localTask,
                taskData: $taskJson['tasks'][0],
                searchValueService: $searchValueService,
            );
        }
    }
}
