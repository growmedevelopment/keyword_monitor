<?php

namespace App\Services;

use App\Models\Keyword;
use App\Models\SearchValue;
use App\Models\DataForSeoTask;
use App\Services\DataForSeo\CredentialsService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SearchValueService
{
    /**
     * Update or create search value for a keyword.
     *
     * @param Keyword $keyword
     * @param array $data
     *
     * @return Model
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
     *
     * @param Keyword $keyword
     * @return array
     */
    public function createTaskForKeyword(Keyword $keyword): array
    {
        $credentials = CredentialsService::get();
        $project = $keyword->project;

        $payload = [[
            'keywords' => [$keyword->keyword],
            'location_code' => (int) $keyword->location,
            'language_code' => $keyword->language,
            'tag' => "search_value_{$keyword->id}_project_{$project->id}",
        ]];

        try {
            $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
                ->post('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_post', $payload);

            $json = $response->json();

            Log::info('DataForSEO Google Ads Search Volume task response', ['data' => $json]);

            if ($response->successful() && isset($json['tasks'][0]['id'])) {
                $task = $json['tasks'][0];

                // Mark task as submitted
                $taskModel = DataForSeoTask::create([
                    'keyword_id' => $keyword->id,
                    'project_id' => $project->id,
                    'task_id' => $task['id'],
                    'status_message' => $task['status_message'],
                    'status_code' => $task['status_code'],
                    'cost' => $task['cost'],
                    'submitted_at' => now(),
                    'raw_response' => json_encode($task, JSON_THROW_ON_ERROR),
                ]);

                return [
                    'success' => true,
                    'message' => 'Google Ads task created successfully. Results will be fetched shortly.',
                    'task' => $taskModel,
                    'api_response' => $task,
                ];
            }

            Log::warning('Invalid DataForSEO Google Ads response.', [
                'keyword' => $keyword->keyword,
                'response' => $json,
            ]);

            return [
                'success' => false,
                'message' => 'Invalid response from DataForSEO.',
                'errors' => $json,
            ];
        } catch (\Throwable $e) {
            Log::error('Failed to submit Google Ads task to DataForSEO.', [
                'keyword' => $keyword->keyword,
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
     * @param int|null $projectId           If provided, limits to a single project
     * @param bool     $onlyWithoutValue    If true, processes only keywords missing SearchValue
     * @param int      $sleepMicros         Micro-sleep between API calls to respect rate limits
     * @return array                        Summary counters and errors
     */
    public function refreshAllKeywordsSearchVolume(?int $projectId = null, bool $onlyWithoutValue = true, int $sleepMicros = 200_000): array
    {
        $total = 0;
        $submitted = 0;
        $failed = 0;
        $errors = [];

        $query = Keyword::query()
            ->when($projectId, fn($q) => $q->where('project_id', $projectId))
            ->when($onlyWithoutValue, fn($q) => $q->doesntHave('searchValue'))
            ->where('is_active', true);

        $query->chunkById(200, function ($keywords) use (&$total, &$submitted, &$failed, &$errors, $sleepMicros) {
            foreach ($keywords as $keyword) {
                $total++;
                try {
                    $res = $this->createTaskForKeyword($keyword);
                    if (($res['success'] ?? false) === true) {
                        $submitted++;
                    } else {
                        $failed++;
                        $errors[$keyword->id] = $res['message'] ?? 'Unknown error';
                    }
                } catch (\Throwable $e) {
                    $failed++;
                    $errors[$keyword->id] = $e->getMessage();
                }

                // Throttle between requests
                if ($sleepMicros > 0) {
                    usleep($sleepMicros);
                }
            }
        });

        Log::info('Search Volume bulk refresh summary', compact('total', 'submitted', 'failed'));

        return compact('total', 'submitted', 'failed', 'errors');
    }

    /**
     * Get search value for a keyword.
     *
     * @param Keyword $keyword
     * @return SearchValue|null
     */
    public function getForKeyword(Keyword $keyword): ?SearchValue
    {
        return $keyword->searchValue;
    }
}
