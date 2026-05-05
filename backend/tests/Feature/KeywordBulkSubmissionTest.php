<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\FetchReadySearchVolumeTasksJob;
use App\Jobs\FetchReadySerpTasksJob;
use App\Jobs\ProcessKeywordSubmissionChunkJob;
use App\Models\DataForSeoTask;
use App\Models\Project;
use App\Models\User;
use App\Services\DataForSeoTaskResultProcessor;
use App\Services\KeywordSubmissionService;
use App\Services\SearchValueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KeywordBulkSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_bulk_keyword_addition_is_chunked_into_background_jobs(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
        ]);

        Sanctum::actingAs($user);

        $keywords = array_map(
            static fn (int $index): string => "keyword {$index}",
            range(1, 130),
        );

        $response = $this->postJson("/api/projects/{$project->id}/keywords/create", [
            'keywords' => $keywords,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.added_count', 130)
            ->assertJsonPath('data.skipped_count', 0);

        Queue::assertPushed(ProcessKeywordSubmissionChunkJob::class, 2);

        $queuedKeywordCount = 0;

        Queue::assertPushed(ProcessKeywordSubmissionChunkJob::class, function (ProcessKeywordSubmissionChunkJob $job) use (&$queuedKeywordCount): bool {
            $queuedKeywordCount += count($job->keywordIds);

            return count($job->keywordIds) <= ProcessKeywordSubmissionChunkJob::DEFAULT_CHUNK_SIZE
                && $job->shouldRefreshSearchVolume === true;
        });

        $this->assertSame(130, $queuedKeywordCount);
    }

    public function test_chunk_job_submits_keywords_to_dataforseo_in_one_batch_request(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
        ]);

        $firstKeyword = $project->keywords()->create([
            'keyword' => 'alpha keyword',
            'location' => $project->location_code,
            'language' => 'en',
            'tracking_priority' => 1,
            'is_active' => true,
        ]);

        $secondKeyword = $project->keywords()->create([
            'keyword' => 'beta keyword',
            'location' => $project->location_code,
            'language' => 'en',
            'tracking_priority' => 1,
            'is_active' => true,
        ]);

        Http::fake([
            'https://api.dataforseo.com/v3/serp/google/organic/task_post' => Http::response([
                'tasks' => [
                    [
                        'id' => 'task-alpha',
                        'status_code' => 20100,
                        'status_message' => 'Task Created.',
                        'cost' => 0.001,
                        'data' => [
                            'tag' => "keyword_{$firstKeyword->id}_project_{$project->id}",
                        ],
                    ],
                    [
                        'id' => 'task-beta',
                        'status_code' => 20100,
                        'status_message' => 'Task Created.',
                        'cost' => 0.001,
                        'data' => [
                            'tag' => "keyword_{$secondKeyword->id}_project_{$project->id}",
                        ],
                    ],
                ],
            ], 200),
        ]);

        $job = new ProcessKeywordSubmissionChunkJob([$firstKeyword->id, $secondKeyword->id], false);

        $job->handle(app(KeywordSubmissionService::class));

        Http::assertSentCount(1);
        Http::assertSent(function (\Illuminate\Http\Client\Request $request) use ($firstKeyword, $secondKeyword, $project): bool {
            if ($request->url() !== 'https://api.dataforseo.com/v3/serp/google/organic/task_post') {
                return false;
            }

            $payload = $request->data();

            return count($payload) === 2
                && $payload[0]['tag'] === "keyword_{$firstKeyword->id}_project_{$project->id}"
                && $payload[1]['tag'] === "keyword_{$secondKeyword->id}_project_{$project->id}";
        });

        $this->assertDatabaseCount('data_for_seo_tasks', 2);
        $this->assertDatabaseHas('data_for_seo_tasks', [
            'keyword_id' => $firstKeyword->id,
            'project_id' => $project->id,
            'task_id' => 'task-alpha',
        ]);
        $this->assertDatabaseHas('data_for_seo_tasks', [
            'keyword_id' => $secondKeyword->id,
            'project_id' => $project->id,
            'task_id' => 'task-beta',
        ]);
    }

    public function test_search_volume_tasks_are_batched_into_one_request(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
        ]);

        $firstKeyword = $project->keywords()->create([
            'keyword' => 'alpha keyword',
            'location' => $project->location_code,
            'language' => 'en',
            'tracking_priority' => 1,
            'is_active' => true,
        ]);

        $secondKeyword = $project->keywords()->create([
            'keyword' => 'beta keyword',
            'location' => $project->location_code,
            'language' => 'en',
            'tracking_priority' => 1,
            'is_active' => true,
        ]);

        Http::fake([
            'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_post' => Http::response([
                'tasks' => [
                    [
                        'id' => 'search-volume-batch-task',
                        'status_code' => 20100,
                        'status_message' => 'Task Created.',
                        'cost' => 0.001,
                        'data' => [
                            'keywords' => ['alpha keyword', 'beta keyword'],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $result = app(SearchValueService::class)->createTasksForKeywords(
            new \Illuminate\Database\Eloquent\Collection([$firstKeyword, $secondKeyword]),
        );

        $this->assertTrue($result['success']);

        Http::assertSentCount(1);
        Http::assertSent(function (\Illuminate\Http\Client\Request $request): bool {
            if ($request->url() !== 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_post') {
                return false;
            }

            $payload = $request->data();

            return count($payload) === 1
                && count($payload[0]['keywords']) === 2
                && $payload[0]['keywords'][0] === 'alpha keyword'
                && $payload[0]['keywords'][1] === 'beta keyword';
        });

        $this->assertDatabaseCount('data_for_seo_tasks', 1);
        $this->assertDatabaseHas('data_for_seo_tasks', [
            'keyword_id' => null,
            'project_id' => $project->id,
            'task_id' => 'search-volume-batch-task',
        ]);

        Queue::assertNothingPushed();
    }

    public function test_search_volume_tasks_ready_job_updates_all_keywords_from_batch_result(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
        ]);

        $firstKeyword = $project->keywords()->create([
            'keyword' => 'alpha keyword',
            'location' => $project->location_code,
            'language' => 'en',
            'tracking_priority' => 1,
            'is_active' => true,
        ]);

        $secondKeyword = $project->keywords()->create([
            'keyword' => 'beta keyword',
            'location' => $project->location_code,
            'language' => 'en',
            'tracking_priority' => 1,
            'is_active' => true,
        ]);

        $task = DataForSeoTask::create([
            'keyword_id' => null,
            'project_id' => $project->id,
            'task_id' => 'search-volume-batch-task',
            'status_message' => 'Task Created.',
            'status_code' => 20100,
            'submitted_at' => now(),
            'raw_response' => json_encode([
                'data' => [
                    'keywords' => ['alpha keyword', 'beta keyword'],
                ],
            ], JSON_THROW_ON_ERROR),
            'batch_keyword_map' => [
                'alpha keyword' => $firstKeyword->id,
                'beta keyword' => $secondKeyword->id,
            ],
        ]);

        Http::fake([
            'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/tasks_ready' => Http::response([
                'tasks' => [
                    [
                        'result' => [
                            [
                                'id' => 'search-volume-batch-task',
                                'endpoint' => '/v3/keywords_data/google_ads/search_volume/task_get/search-volume-batch-task',
                            ],
                        ],
                    ],
                ],
            ], 200),
            'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_get/search-volume-batch-task' => Http::response([
                'tasks' => [
                    [
                        'status_code' => 20000,
                        'status_message' => 'Ok.',
                        'result' => [
                            [
                                'keyword' => 'alpha keyword',
                                'search_volume' => 120,
                                'cpc' => 1.25,
                                'competition' => 0.4,
                                'competition_index' => 40,
                                'low_top_of_page_bid' => 0.8,
                                'high_top_of_page_bid' => 1.5,
                                'search_partners' => false,
                            ],
                            [
                                'keyword' => 'beta keyword',
                                'search_volume' => 250,
                                'cpc' => 2.5,
                                'competition' => 0.7,
                                'competition_index' => 70,
                                'low_top_of_page_bid' => 1.7,
                                'high_top_of_page_bid' => 3.2,
                                'search_partners' => true,
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $job = new FetchReadySearchVolumeTasksJob;
        $job->handle(
            app(SearchValueService::class),
            app(DataForSeoTaskResultProcessor::class),
        );

        $this->assertDatabaseHas('search_values', [
            'keyword_id' => $firstKeyword->id,
            'search_volume' => 120,
            'competition_index' => 40,
        ]);
        $this->assertDatabaseHas('search_values', [
            'keyword_id' => $secondKeyword->id,
            'search_volume' => 250,
            'competition_index' => 70,
            'search_partners' => 1,
        ]);
    }

    public function test_serp_tasks_ready_job_updates_keyword_result_and_rank(): void
    {
        Queue::fake();
        config(['broadcasting.default' => 'null']);

        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'url' => 'https://example.com',
        ]);

        $keyword = $project->keywords()->create([
            'keyword' => 'alpha keyword',
            'location' => $project->location_code,
            'language' => 'en',
            'tracking_priority' => 1,
            'is_active' => true,
        ]);

        $task = DataForSeoTask::create([
            'keyword_id' => $keyword->id,
            'project_id' => $project->id,
            'task_id' => 'serp-task-1',
            'status_message' => 'Task Created.',
            'status_code' => 20100,
            'submitted_at' => now(),
            'raw_response' => json_encode([
                'data' => [
                    'keyword' => 'alpha keyword',
                ],
            ], JSON_THROW_ON_ERROR),
        ]);

        Http::fake([
            'https://api.dataforseo.com/v3/serp/google/organic/tasks_ready' => Http::response([
                'tasks' => [
                    [
                        'result' => [
                            [
                                'id' => 'serp-task-1',
                                'endpoint_regular' => '/v3/serp/google/organic/task_get/regular/serp-task-1',
                            ],
                        ],
                    ],
                ],
            ], 200),
            'https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/serp-task-1' => Http::response([
                'tasks' => [
                    [
                        'status_code' => 20000,
                        'status_message' => 'Ok.',
                        'result' => [
                            [
                                'items' => [
                                    [
                                        'type' => 'organic',
                                        'rank_group' => 3,
                                        'rank_absolute' => 3,
                                        'domain' => 'example.com',
                                        'title' => 'Example title',
                                        'description' => 'Example description',
                                        'url' => 'https://example.com/page',
                                        'breadcrumb' => 'Example > Page',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $job = new FetchReadySerpTasksJob;
        $job->handle(app(DataForSeoTaskResultProcessor::class));

        $this->assertDatabaseHas('data_for_seo_results', [
            'data_for_seo_task_id' => $task->id,
            'rank_group' => 3,
            'domain' => 'example.com',
        ]);
        $this->assertDatabaseHas('keyword_ranks', [
            'keyword_id' => $keyword->id,
            'position' => 3,
            'url' => 'https://example.com/page',
        ]);
    }

    public function test_recover_pending_command_processes_legacy_serp_task(): void
    {
        Queue::fake();
        config(['broadcasting.default' => 'null']);

        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'url' => 'https://example.com',
        ]);

        $keyword = $project->keywords()->create([
            'keyword' => 'legacy keyword',
            'location' => $project->location_code,
            'language' => 'en',
            'tracking_priority' => 1,
            'is_active' => true,
        ]);

        $task = DataForSeoTask::create([
            'keyword_id' => $keyword->id,
            'project_id' => $project->id,
            'task_id' => 'legacy-serp-task',
            'status_message' => 'Task Created.',
            'status_code' => 20100,
            'submitted_at' => now()->subMonths(3),
            'raw_response' => json_encode([
                'data' => [
                    'keyword' => 'legacy keyword',
                ],
            ], JSON_THROW_ON_ERROR),
        ]);

        Http::fake([
            'https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/legacy-serp-task' => Http::response([
                'tasks' => [
                    [
                        'status_code' => 20000,
                        'status_message' => 'Ok.',
                        'result' => [
                            [
                                'items' => [
                                    [
                                        'type' => 'organic',
                                        'rank_group' => 1,
                                        'rank_absolute' => 1,
                                        'domain' => 'example.com',
                                        'title' => 'Recovered title',
                                        'description' => 'Recovered description',
                                        'url' => 'https://example.com/recovered',
                                        'breadcrumb' => 'Recovered',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $exitCode = Artisan::call('dataforseo:recover-pending', [
            '--id' => [$task->id],
        ]);

        $this->assertSame(0, $exitCode);
        $this->assertDatabaseHas('data_for_seo_tasks', [
            'id' => $task->id,
            'status_code' => '20000',
        ]);
        $this->assertNotNull($task->fresh()->completed_at);
        $this->assertDatabaseHas('data_for_seo_results', [
            'data_for_seo_task_id' => $task->id,
            'rank_group' => 1,
            'domain' => 'example.com',
        ]);
        $this->assertDatabaseHas('keyword_ranks', [
            'keyword_id' => $keyword->id,
            'position' => 1,
            'url' => 'https://example.com/recovered',
        ]);
    }

    public function test_recover_pending_command_marks_old_task_without_result_as_expired(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'url' => 'https://example.com',
        ]);

        $keyword = $project->keywords()->create([
            'keyword' => 'expired keyword',
            'location' => $project->location_code,
            'language' => 'en',
            'tracking_priority' => 1,
            'is_active' => true,
        ]);

        $task = DataForSeoTask::create([
            'keyword_id' => $keyword->id,
            'project_id' => $project->id,
            'task_id' => 'expired-serp-task',
            'status_message' => 'Task Created.',
            'status_code' => 20100,
            'submitted_at' => now()->subDays(45),
            'raw_response' => json_encode([
                'data' => [
                    'keyword' => 'expired keyword',
                ],
            ], JSON_THROW_ON_ERROR),
        ]);

        Http::fake([
            'https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/expired-serp-task' => Http::response([
                'tasks' => [
                    [
                        'status_code' => 20000,
                        'status_message' => 'Ok.',
                    ],
                ],
            ], 200),
        ]);

        $exitCode = Artisan::call('dataforseo:recover-pending', [
            '--id' => [$task->id],
        ]);

        $this->assertSame(0, $exitCode);
        $this->assertDatabaseHas('data_for_seo_tasks', [
            'id' => $task->id,
            'status_code' => '20000',
            'status_message' => 'Result expired in DataForSEO before local recovery.',
        ]);
        $this->assertNotNull($task->fresh()->completed_at);
        $this->assertDatabaseMissing('data_for_seo_results', [
            'data_for_seo_task_id' => $task->id,
        ]);
    }
}
