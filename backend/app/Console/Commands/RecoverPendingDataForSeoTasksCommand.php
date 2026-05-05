<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\DataForSeoTaskStatus;
use App\Models\DataForSeoTask;
use App\Services\DataForSeo\CredentialsService;
use App\Services\DataForSeoTaskResultProcessor;
use App\Services\SearchValueService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecoverPendingDataForSeoTasksCommand extends Command
{
    private const int RESULT_RETENTION_DAYS = 30;

    protected $signature = 'dataforseo:recover-pending
        {--limit=100 : Maximum number of pending tasks to inspect}
        {--id=* : Specific local data_for_seo_tasks IDs to recover}
        {--task-id=* : Specific remote DataForSEO task IDs to recover}
        {--broadcast : Broadcast keyword updates while recovering SERP tasks}';

    protected $description = 'Recover legacy DataForSEO tasks that have results remotely but still have completed_at = NULL locally.';

    public function handle(
        SearchValueService $searchValueService,
        DataForSeoTaskResultProcessor $taskResultProcessor,
    ): int {
        $credentials = CredentialsService::get();

        $tasks = $this->buildTaskQuery()->get();

        if ($tasks->isEmpty()) {
            $this->info('No pending DataForSEO tasks matched the recovery query.');

            return self::SUCCESS;
        }

        $processed = 0;
        $expired = 0;
        $stillPending = 0;
        $failed = 0;

        foreach ($tasks as $task) {
            $endpoint = $this->resolveTaskGetEndpoint($task);

            if ($endpoint === null) {
                $stillPending++;
                $this->warn(sprintf(
                    'Skipped task #%d (%s): unable to determine endpoint.',
                    $task->id,
                    $task->task_id,
                ));

                continue;
            }

            try {
                $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
                    ->get('https://api.dataforseo.com'.$endpoint);

                $json = $response->json();

                if (! $response->successful() || ! isset($json['tasks'][0])) {
                    $failed++;
                    $this->error(sprintf(
                        'Task #%d (%s) returned an invalid response.',
                        $task->id,
                        $task->task_id,
                    ));

                    Log::warning('Recover pending DataForSEO task received invalid response.', [
                        'local_task_id' => $task->id,
                        'task_id' => $task->task_id,
                        'response' => $json,
                    ]);

                    continue;
                }

                $taskData = $json['tasks'][0];
                $statusCode = (int) ($taskData['status_code'] ?? 0);

                $task->update([
                    'status_code' => $taskData['status_code'] ?? $task->status_code,
                    'status_message' => $taskData['status_message'] ?? $task->status_message,
                ]);

                if (in_array($statusCode, [DataForSeoTaskStatus::QUEUED, DataForSeoTaskStatus::PROCESSING], true)) {
                    $stillPending++;
                    $this->line(sprintf(
                        'Task #%d (%s) is still pending remotely with status %d.',
                        $task->id,
                        $task->task_id,
                        $statusCode,
                    ));

                    continue;
                }

                if ($this->isTaskResultMissing($taskData)) {
                    if ($this->shouldMarkAsExpired($task)) {
                        $this->markTaskAsExpired($task);
                        $expired++;

                        $this->warn(sprintf(
                            'Marked task #%d (%s) as expired because DataForSEO no longer has the result.',
                            $task->id,
                            $task->task_id,
                        ));
                    } else {
                        $stillPending++;
                        $this->line(sprintf(
                            'Task #%d (%s) has no result yet and remains pending.',
                            $task->id,
                            $task->task_id,
                        ));
                    }

                    continue;
                }

                if ($this->isSearchVolumeTask($task)) {
                    $taskResultProcessor->processSearchVolumeTaskData($task, $taskData, $searchValueService);
                } else {
                    $taskResultProcessor->processSerpTaskData(
                        task: $task,
                        taskData: $taskData,
                        broadcastUpdate: (bool) $this->option('broadcast'),
                    );
                }

                $processed++;
                $this->info(sprintf(
                    'Recovered task #%d (%s).',
                    $task->id,
                    $task->task_id,
                ));
            } catch (\Throwable $e) {
                $failed++;

                $this->error(sprintf(
                    'Task #%d (%s) failed: %s',
                    $task->id,
                    $task->task_id,
                    $e->getMessage(),
                ));

                Log::error('Recover pending DataForSEO task failed.', [
                    'local_task_id' => $task->id,
                    'task_id' => $task->task_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->table(
            ['processed', 'expired', 'still_pending', 'failed'],
            [[$processed, $expired, $stillPending, $failed]],
        );

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function buildTaskQuery()
    {
        $query = DataForSeoTask::query()
            ->with(['keyword.project'])
            ->whereNull('completed_at')
            ->orderBy('submitted_at');

        $ids = array_map('intval', (array) $this->option('id'));
        $ids = array_values(array_filter($ids, static fn (int $id): bool => $id > 0));

        if ($ids !== []) {
            return $query->whereIn('id', $ids);
        }

        $taskIds = array_values(array_filter((array) $this->option('task-id')));

        if ($taskIds !== []) {
            return $query->whereIn('task_id', $taskIds);
        }

        return $query->limit((int) $this->option('limit'));
    }

    private function isSearchVolumeTask(DataForSeoTask $task): bool
    {
        if ($task->batch_keyword_map !== null) {
            return true;
        }

        $rawResponse = json_decode((string) $task->raw_response, true);

        return isset($rawResponse['data']['keywords']);
    }

    private function resolveTaskGetEndpoint(DataForSeoTask $task): ?string
    {
        if ($this->isSearchVolumeTask($task)) {
            return '/v3/keywords_data/google_ads/search_volume/task_get/'.$task->task_id;
        }

        if ($task->keyword_id === null) {
            return null;
        }

        return '/v3/serp/google/organic/task_get/regular/'.$task->task_id;
    }

    private function isTaskResultMissing(array $taskData): bool
    {
        return ! isset($taskData['result'][0]);
    }

    private function shouldMarkAsExpired(DataForSeoTask $task): bool
    {
        return $task->submitted_at !== null
            && $task->submitted_at->lt(now()->subDays(self::RESULT_RETENTION_DAYS));
    }

    private function markTaskAsExpired(DataForSeoTask $task): void
    {
        $task->update([
            'completed_at' => now(),
            'status_message' => 'Result expired in DataForSEO before local recovery.',
        ]);
    }
}
