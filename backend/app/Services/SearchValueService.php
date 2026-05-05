<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\DataForSeoTask;
use App\Models\Keyword;
use App\Models\SearchValue;
use App\Services\DataForSeo\CredentialsService;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SearchValueService
{
    public const int SEARCH_VOLUME_BATCH_SIZE = 700;

    /**
     * Update or create search value for a keyword.
     */
    public function updateOrCreateForKeyword(Keyword $keyword, array $data): Model
    {
        return $keyword->searchValue()->updateOrCreate(
            ['keyword_id' => $keyword->id],
            [
                'search_volume' => $data['search_volume'] ?? null,
                'cpc' => $data['cpc'] ?? null,
                'competition' => $data['competition'] ?? null,
                'competition_index' => $data['competition_index'] ?? null,
                'low_top_of_page_bid' => $data['low_top_of_page_bid'] ?? null,
                'high_top_of_page_bid' => $data['high_top_of_page_bid'] ?? null,
                'search_partners' => $data['search_partners'] ?? false,
                'currency' => $data['currency'] ?? 'USD',
            ]
        );
    }

    /**
     * Submit a task for Google Ads Search Volume to DataForSEO.
     */
    public function createTaskForKeyword(Keyword $keyword): array
    {
        return $this->createTasksForKeywords(new EloquentCollection([$keyword]));
    }

    public function createTasksForKeywords(EloquentCollection $keywords): array
    {
        if ($keywords->isEmpty()) {
            return [
                'success' => true,
                'message' => 'No keywords to submit.',
                'submitted' => 0,
                'tasks' => [],
            ];
        }

        $keywords->loadMissing('project');

        $submitted = 0;
        $createdTasks = [];
        $errors = [];

        $groupedKeywords = $keywords->groupBy(function (Keyword $keyword): string {
            return implode(':', [
                $keyword->project_id,
                (string) $keyword->location,
                $keyword->language,
            ]);
        });

        foreach ($groupedKeywords as $group) {
            $chunkedGroups = $group instanceof Collection
                ? $group->chunk(self::SEARCH_VOLUME_BATCH_SIZE)
                : collect([$group]);

            foreach ($chunkedGroups as $keywordChunk) {
                $result = $this->submitKeywordChunkForSearchVolume(
                    keywords: new EloquentCollection($keywordChunk->all()),
                );

                if (($result['success'] ?? false) === true) {
                    $submitted++;
                    $createdTasks[] = $result['task'];

                    continue;
                }

                $errors[] = $result['errors'] ?? $result['message'] ?? 'Unknown error';
            }
        }

        return [
            'success' => count($errors) === 0,
            'message' => count($errors) === 0
                ? 'Google Ads tasks created successfully. Results will be fetched shortly.'
                : 'Some Google Ads tasks failed to submit.',
            'submitted' => $submitted,
            'tasks' => $createdTasks,
            'errors' => $errors,
        ];
    }

    public function buildBatchKeywordMap(EloquentCollection $keywords): array
    {
        $keywordMap = [];

        foreach ($keywords as $keyword) {
            /** @var Keyword $keyword */
            $keywordMap[mb_strtolower(trim($keyword->keyword))] = $keyword->id;
        }

        return $keywordMap;
    }

    private function submitKeywordChunkForSearchVolume(EloquentCollection $keywords): array
    {
        /** @var Keyword|null $firstKeyword */
        $firstKeyword = $keywords->first();

        if ($firstKeyword === null) {
            return [
                'success' => false,
                'message' => 'No keywords provided for search volume submission.',
            ];
        }

        $credentials = CredentialsService::get();
        $project = $firstKeyword->project;
        $keywordMap = $this->buildBatchKeywordMap($keywords);

        $payload = [[
            'keywords' => $keywords
                ->map(static fn (Keyword $keyword): string => $keyword->keyword)
                ->values()
                ->all(),
            'location_code' => (int) $firstKeyword->location,
            'language_code' => $firstKeyword->language,
            'tag' => sprintf(
                'search_value_project_%d_batch_%s',
                $project->id,
                sha1(implode('|', array_values($keywordMap))),
            ),
        ]];

        try {
            $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
                ->post('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_post', $payload);

            $json = $response->json();

            Log::info('DataForSEO Google Ads Search Volume batch task response', [
                'keyword_count' => $keywords->count(),
                'data' => $json,
            ]);

            if ($response->successful() && isset($json['tasks'][0]['id'])) {
                $task = $json['tasks'][0];

                $taskModel = DataForSeoTask::create([
                    'keyword_id' => $keywords->count() === 1 ? $firstKeyword->id : null,
                    'project_id' => $project->id,
                    'task_id' => $task['id'],
                    'status_message' => $task['status_message'] ?? null,
                    'status_code' => $task['status_code'] ?? null,
                    'cost' => $task['cost'] ?? null,
                    'submitted_at' => now(),
                    'raw_response' => json_encode($task, JSON_THROW_ON_ERROR),
                    'batch_keyword_map' => $keywords->count() > 1 ? $keywordMap : null,
                ]);

                return [
                    'success' => true,
                    'message' => 'Google Ads task created successfully. Results will be fetched shortly.',
                    'task' => $taskModel,
                    'api_response' => $task,
                ];
            }

            Log::warning('Invalid DataForSEO Google Ads batch response.', [
                'keywords' => array_keys($keywordMap),
                'response' => $json,
            ]);

            return [
                'success' => false,
                'message' => 'Invalid response from DataForSEO.',
                'errors' => $json,
            ];
        } catch (\Throwable $e) {
            Log::error('Failed to submit Google Ads batch task to DataForSEO.', [
                'keywords' => array_keys($keywordMap),
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Exception occurred during submission.',
                'errors' => $e->getMessage(),
            ];
        }
    }

    /**
     * Admin helper: iterate through keywords and queue Search Volume tasks for each.
     *
     * @param  int|null  $projectId  If provided, limits to a single project
     * @param  bool  $onlyWithoutValue  If true, processes only keywords missing SearchValue
     * @param  int  $sleepMicros  Micro-sleep between API calls to respect rate limits
     * @return array Summary counters and errors
     */
    public function refreshAllKeywordsSearchVolume(?int $projectId = null, bool $onlyWithoutValue = true, int $sleepMicros = 200_000): array
    {
        $total = 0;
        $submitted = 0;
        $failed = 0;
        $errors = [];

        $query = Keyword::query()
            ->when($projectId, fn ($q) => $q->where('project_id', $projectId))
            ->when($onlyWithoutValue, fn ($q) => $q->doesntHave('searchValue'))
            ->where('is_active', true);

        $query->chunkById(200, function ($keywords) use (&$total, &$submitted, &$failed, &$errors, $sleepMicros): void {
            $keywordCollection = new EloquentCollection($keywords->all());
            $total += $keywordCollection->count();

            try {
                $result = $this->createTasksForKeywords($keywordCollection);

                $submitted += (int) ($result['submitted'] ?? 0);

                $failedTasks = is_array($result['errors'] ?? null) ? count($result['errors']) : 0;
                $failed += $failedTasks;

                if (! empty($result['errors'])) {
                    $errors = array_merge($errors, $result['errors']);
                }
            } catch (\Throwable $e) {
                $failed++;
                $errors[] = $e->getMessage();
            }

            if ($sleepMicros > 0) {
                usleep($sleepMicros);
            }
        });

        Log::info('Search Volume bulk refresh summary', compact('total', 'submitted', 'failed'));

        return compact('total', 'submitted', 'failed', 'errors');
    }

    /**
     * Get search value for a keyword.
     */
    public function getForKeyword(Keyword $keyword): ?SearchValue
    {
        return $keyword->searchValue;
    }
}
