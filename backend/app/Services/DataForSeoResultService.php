<?php

namespace App\Services;

use App\Models\DataForSeoTask;
use App\Models\Keyword;
use App\Models\DataForSeoResult;
use App\Models\KeywordRank;
use App\Services\DataForSeo\CredentialsService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Enums\DataForSeoTaskStatus;
use App\Events\KeywordUpdatedEvent;

class DataForSeoResultService
{
    /**
     * Fetch SEO results for all submitted DataForSEO tasks associated with a specific keyword.
     *
     * This method retrieves all `Submitted` tasks for the given keyword, polls the
     * DataForSEO API for their results, and processes them to extract and store
     * the best-ranked data.
     *
     * @param Keyword $keyword The keyword whose submitted tasks should be processed.
     *
     * @return \Illuminate\Support\Collection  A collection of processed results for the keyword’s submitted tasks.
     * @throws \Exception
     */
    public function fetchSEOResultsByKeyword(Keyword $keyword): Collection
    {
        $credentials = CredentialsService::get();
        $projectUrl = $keyword->project->url;
        $tasks = $this->getSubmittedTasks($keyword);
        return $this->processTasks($tasks, $projectUrl, $credentials);
    }


    /**
     * Retrieve all submitted DataForSEO tasks for the given keyword.
     *
     * This method queries the related DataForSEO tasks of the keyword and
     * returns those with a `Submitted` status.
     *
     * @param Keyword $keyword  The keyword model whose submitted tasks will be retrieved.
     *
     * @return \Illuminate\Support\Collection  A collection of submitted DataForSEO task records.
     */
    private function getSubmittedTasks(Keyword $keyword): Collection
    {
        return $keyword->dataForSeoTasks()->where('status', DataForSeoTaskStatus::SUBMITTED)->get();
    }

    /**
     * Fetch the result of a submitted DataForSEO task by task ID.
     *
     * Sends a GET request to the DataForSEO API to retrieve the results for a
     * specific task. Logs the response and handles errors gracefully, returning
     * an empty array if the request fails.
     *
     * @param string $taskId The unique ID of the DataForSEO task.
     * @param array $credentials The API credentials ['username', 'password'] for authentication.
     *
     * @return array                The parsed result items from the DataForSEO API, or an empty array if unavailable.
     * @throws \Illuminate\Http\Client\ConnectionException
     */
    private function fetchTaskResult(string $taskId, array $credentials): array
    {
        $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
            ->get("https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/{$taskId}");

        $json = $response->json();

        $task = DataForSeoTask::where('task_id', $taskId)->with('keyword.project')->first();

        $this->log('info', 'Polling DataForSEO task result', [
            'task_id' => $taskId,
            'keyword' => $task->keyword->keyword ?? null,
            'project_id' => $task->keyword->project_id ?? null,
            'response' => $json,
        ]);

        if (!$response->successful()) {

            $this->log('warning', 'Failed to fetch DataForSEO task result', [
                'task_id' => $taskId,
                'status'  => $response->status(),
                'body'    => $response->body(),
            ]);
            return [];
        }

        return $json['tasks'][0]['result'][0]['items'] ?? [];
    }

    /**
     * Extract the best-ranked search result for the given project URL from a list of SERP items.
     *
     * This method filters SERP items returned by the DataForSEO API to find the
     * highest-ranked result matching the project's domain. If no result matches,
     * it returns a default "no results" structure.
     *
     * @param array  $items       The list of SERP result items from the API.
     * @param string $projectUrl  The URL of the project to match against the SERP results.
     *
     * @return array              The best-ranked result or a default "no results" array.
     */
    private function extractBestRanked(array $items, string $projectUrl): array
    {
        $this->log('info','Extracting best ranked', [
            'project_url' => $projectUrl,
            'items_count' => count($items),
            'first_item_url' => $items[0]['url'] ?? null
        ]);

        $projectHost = ltrim(str_ireplace('www.', '', parse_url($projectUrl, PHP_URL_HOST)));

        $results = collect($items)
            ->filter(function ($item) use ($projectHost) {
                if (!isset($item['url'], $item['rank_group'])) {
                    return false;
                }

                $itemHost = ltrim(str_ireplace('www.', '', parse_url($item['url'], PHP_URL_HOST)));
                return $itemHost === $projectHost;
            })
            ->sortBy('rank_group')
            ->first();

        if (is_null($results)) {
            $results = [
                'rank_group'  => 101,
                'rank_absolute' => 101,
                'type'        => 'no results',
                'domain'      => $projectHost,
                'title'       => 'no results',
                'description' => 'no results',
                'url'         => 'no results',
                'breadcrumb'  => 'no results',
                'tracked_at'  => now()->toDateString(),
                'status'      => 'No Rank Found'
            ];
        }

        return $results;
    }

    /**
     * Store the best-ranked result data into the database.
     *
     * This method creates a new `DataForSeoResult` record linked to the specified
     * DataForSEO task, saving ranking and metadata details.
     *
     * @param int   $taskId  The ID of the associated DataForSEO task.
     * @param array $data    The result data including ranking details and metadata.
     *
     * @return DataForSeoResult  The newly created DataForSeoResult model instance.
     */
    private function storeResult(int $taskId, array $data): DataForSeoResult
    {
        return DataForSeoResult::firstOrCreate(
            ['data_for_seo_task_id' => $taskId],
            [
                'type'                 => $data['type'] ?? null,
                'rank_group'           => $data['rank_group'] ?? null,
                'rank_absolute'        => $data['rank_absolute'] ?? null,
                'domain'               => $data['domain'] ?? null,
                'title'                => $data['title'] ?? null,
                'description'          => $data['description'] ?? null,
                'url'                  => $data['url'] ?? null,
                'breadcrumb'           => $data['breadcrumb'] ?? null,
            ]
        );
    }

    /**
     * Process submitted DataForSEO tasks and extract their ranking results.
     *
     * For each submitted task, this method attempts to fetch the task result from
     * the DataForSEO API. If a result is found, the best-ranked result is saved;
     * otherwise, the task status is updated to `Queued` and a polling job is
     * dispatched for asynchronous retrieval.
     *
     * @param \Illuminate\Support\Collection $tasks The collection of submitted DataForSEO tasks.
     * @param string $projectUrl The project URL used to match SERP results.
     * @param array $credentials API credentials ['username', 'password'] for authentication.
     *
     * @return \Illuminate\Support\Collection A collection of saved result records.
     * @throws \Illuminate\Http\Client\ConnectionException
     */
    private function processTasks(Collection $tasks, string $projectUrl, array $credentials): Collection
    {
        $results = collect();

        foreach ($tasks as $task) {
            // Immediate single attempt (no retry loop)
            $items = $this->fetchTaskResult($task->task_id, $credentials);

            if (!empty($items)) {
                $bestRanked = $this->extractBestRanked($items, $projectUrl);
                if ($bestRanked) {

                    $results->push($this->saveResults($task, $bestRanked));
                    continue;
                }
            }

            $task->update(['status' => DataForSeoTaskStatus::QUEUED]);
            // Queue for async polling
//            $initialDelay = config('dataforseo.polling.initial_delay');
//            PollDataForSeoTaskJob::dispatch($task->id)->delay(now()->addSeconds($initialDelay));

        }

        return $results;
    }

    /**
     * Poll the DataForSEO API for a single task to retrieve and save its ranking result.
     *
     * This method retrieves the result of a specific DataForSEO task using its task ID.
     * If a result is found, the best-ranked item is extracted and saved to the database.
     *
     * @param DataForSeoTask $task The DataForSEO task to be polled.
     * @param bool $nonBlocking Whether the polling should be treated as non-blocking (future use).
     *
     * @return bool  Returns true if a result was successfully retrieved and saved; false otherwise.
     * @throws \Exception
     */
    public function pollSingleTask(DataForSeoTask $task, bool $nonBlocking = false): bool
    {
        $credentials = CredentialsService::get();
        $projectUrl  = $task->keyword->project->url;

        $items = $this->fetchTaskResult($task->task_id, $credentials);

        if (!empty($items)) {
            $bestRanked = $this->extractBestRanked($items, $projectUrl);

            if ($bestRanked) {
                $this->saveResults($task, $bestRanked);
                return true;
            }
        }

        return false;
    }

    /**
     * Store the keyword ranking information for a DataForSEO task.
     *
     * This method creates a new `KeywordRank` record using the best-ranked data
     * obtained from the DataForSEO API and associates it with the related keyword.
     *
     * @param DataForSeoTask $task        The DataForSEO task related to the keyword.
     * @param array          $bestRanked  The best-ranked result data, including rank and URL details.
     *
     * @return void
     */
    private function storeKeywordRank(DataForSeoTask $task, array $bestRanked): void {

        KeywordRank::create([
            'keyword_id' => $task->keyword_id,
            'position' => $bestRanked['rank_group'] ?? NULL,
            'url' => $bestRanked['url'] ?? NULL,
            'raw' => $bestRanked, // store full API item
            'tracked_at' => now()->toDateString(),
        ]);
    }

    /**
     * Save the best-ranked result for a DataForSEO task and update its status.
     *
     * This method stores the ranking details in the `DataForSeoResult` table and
     * also records the keyword's rank history. Once saved, the task status is
     * updated to `Completed`.
     *
     * @param DataForSeoTask $task        The DataForSEO task being processed.
     * @param array          $bestRanked  The best-ranked result data from the API.
     *
     * @return DataForSeoResult           The created DataForSeoResult model instance.
     */
    private function saveResults(DataForSeoTask $task, array $bestRanked): DataForSeoResult
    {

        $this->log('info','saveResults', [$bestRanked]);
        $result = $this->storeResult($task->id, $bestRanked);
        $this->storeKeywordRank($task, $bestRanked);

        $task->update([
            'status' => DataForSeoTaskStatus::COMPLETED,
            'completed_at' => now()->toDateString(),
         ]);

        //send data to the front-end via broadcasting
        event(new KeywordUpdatedEvent($task, $result));

        return $result;
    }

    private function log(string $level, string $message, array $context = []): void
    {
        Log::$level('[DataForSEO] ' . $message, $context);
    }
}
