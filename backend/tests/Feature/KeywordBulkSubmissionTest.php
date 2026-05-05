<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\ProcessKeywordSubmissionChunkJob;
use App\Models\Project;
use App\Models\User;
use App\Services\KeywordSubmissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
