<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\KeywordUpdatedEvent;
use App\Models\DataForSeoResult;
use App\Models\DataForSeoTask;
use App\Models\Keyword;
use App\Models\KeywordRank;
use Illuminate\Support\Facades\Log;

class DataForSeoTaskResultProcessor
{
    public function processSerpTaskData(DataForSeoTask $task, array $taskData, bool $broadcastUpdate = true): void
    {
        if ($task->keyword_id === null || $task->keyword === null) {
            Log::warning('Skipped SERP task processing because keyword mapping is missing.', [
                'task_id' => $task->task_id,
            ]);

            return;
        }

        if (! isset($taskData['result'][0])) {
            Log::warning('No SERP result data found for task.', [
                'task_id' => $task->task_id,
            ]);

            return;
        }

        $projectHost = $task->keyword->project->url;
        $items = $taskData['result'][0]['items'] ?? [];
        $resultData = $this->filterDataForSeoItemsByHost($items, $projectHost);

        $task->update([
            'status_message' => $taskData['status_message'] ?? $task->status_message,
            'status_code' => $taskData['status_code'] ?? $task->status_code,
            'completed_at' => now(),
            'raw_response' => json_encode($taskData, JSON_THROW_ON_ERROR),
        ]);

        $result = DataForSeoResult::query()->updateOrCreate(
            ['data_for_seo_task_id' => $task->id],
            [
                'type' => $resultData['type'],
                'rank_group' => $resultData['rank_group'],
                'rank_absolute' => $resultData['rank_absolute'],
                'domain' => $resultData['domain'],
                'url' => $resultData['url'],
                'title' => $resultData['title'],
                'description' => $resultData['description'] ?? null,
                'breadcrumb' => $resultData['breadcrumb'] ?? null,
            ],
        );

        KeywordRank::query()->updateOrCreate(
            [
                'keyword_id' => $task->keyword_id,
                'tracked_at' => now()->toDateString(),
            ],
            [
                'position' => $resultData['rank_group'],
                'url' => $resultData['url'],
                'raw' => $resultData,
            ],
        );

        $task->keyword->update(['last_submitted_at' => now()]);

        if ($broadcastUpdate) {
            broadcast(new KeywordUpdatedEvent($task->fresh(), $result));
        }
    }

    public function processSearchVolumeTaskData(DataForSeoTask $task, array $taskData, SearchValueService $searchValueService): void
    {
        $task->update([
            'status_message' => $taskData['status_message'] ?? $task->status_message,
            'status_code' => $taskData['status_code'] ?? $task->status_code,
            'completed_at' => now(),
            'raw_response' => json_encode($taskData, JSON_THROW_ON_ERROR),
        ]);

        $results = $taskData['result'] ?? [];
        $keywordMap = $task->batch_keyword_map ?? [];

        if ($keywordMap === [] && $task->keyword_id !== null && $task->keyword !== null) {
            $keywordMap = [
                $this->normalizeKeyword($task->keyword->keyword) => $task->keyword_id,
            ];
        }

        $keywords = Keyword::query()
            ->whereIn('id', array_values($keywordMap))
            ->get()
            ->keyBy('id');

        foreach ($results as $result) {
            $keywordText = isset($result['keyword']) ? (string) $result['keyword'] : null;

            if ($keywordText === null) {
                continue;
            }

            $keywordId = $keywordMap[$this->normalizeKeyword($keywordText)] ?? null;

            if (! is_int($keywordId)) {
                Log::warning('Skipped search volume result because keyword mapping is missing.', [
                    'task_id' => $task->task_id,
                    'keyword' => $keywordText,
                ]);

                continue;
            }

            /** @var Keyword|null $keyword */
            $keyword = $keywords->get($keywordId);

            if ($keyword === null) {
                continue;
            }

            $searchValueService->updateOrCreateForKeyword($keyword, [
                'search_volume' => $result['search_volume'] ?? null,
                'cpc' => $result['cpc'] ?? null,
                'competition' => $result['competition'] ?? null,
                'competition_index' => $result['competition_index'] ?? null,
                'low_top_of_page_bid' => $result['low_top_of_page_bid'] ?? null,
                'high_top_of_page_bid' => $result['high_top_of_page_bid'] ?? null,
                'search_partners' => $result['search_partners'] ?? false,
            ]);
        }
    }

    private function filterDataForSeoItemsByHost(array $items, string $projectUrl): array
    {
        $projectDomain = parse_url($projectUrl, PHP_URL_HOST);
        $projectDomain = str_ireplace('www.', '', (string) $projectDomain);

        $result = collect($items)
            ->filter(function (array $item) use ($projectDomain): bool {
                if (! isset($item['domain'], $item['rank_group'])) {
                    return false;
                }

                $itemDomain = str_ireplace('www.', '', (string) $item['domain']);

                return $itemDomain === $projectDomain;
            })
            ->sortBy('rank_group')
            ->first();

        return $result ?? [
            'type' => 'no results',
            'rank_group' => 0,
            'rank_absolute' => 0,
            'domain' => '',
            'title' => 'no results',
            'description' => 'no results',
            'url' => '',
            'breadcrumb' => '',
        ];
    }

    private function normalizeKeyword(string $keyword): string
    {
        return mb_strtolower(trim($keyword));
    }
}
