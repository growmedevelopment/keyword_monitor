<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\ProcessLinkSubmissionChunkJob;
use App\Models\Project;
use App\Models\User;
use App\Services\LinkService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LinkBulkSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_bulk_link_addition_is_chunked_into_background_jobs(): void
    {
        Queue::fake();
        Http::fake();
        Config::set('queue.default', 'database');

        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
        ]);

        Sanctum::actingAs($user);

        $urls = array_map(
            static fn (int $index): string => "https://example{$index}.com",
            range(1, 130),
        );

        $response = $this->postJson("/api/projects/{$project->id}/links", [
            'urls' => $urls,
            'type' => 'backlinks',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'URLs added and queued for checking.')
            ->assertJsonPath('data.added_count', 130)
            ->assertJsonPath('data.skipped_count', 0)
            ->assertJsonPath('data.added_urls.0.is_checking', true)
            ->assertJsonPath('data.added_urls.0.latest_result.http_code', null);

        Queue::assertPushed(ProcessLinkSubmissionChunkJob::class, 2);

        $queuedLinkCount = 0;

        Queue::assertPushed(ProcessLinkSubmissionChunkJob::class, function (ProcessLinkSubmissionChunkJob $job) use (&$queuedLinkCount): bool {
            $queuedLinkCount += count($job->linkTargetIds);

            return count($job->linkTargetIds) <= ProcessLinkSubmissionChunkJob::DEFAULT_CHUNK_SIZE;
        });

        $this->assertSame(130, $queuedLinkCount);
        Http::assertNothingSent();
    }

    public function test_link_submission_chunk_job_submits_backlinks_in_one_batch_request(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
        ]);

        $firstTarget = $project->link_urls()->create([
            'url' => 'https://alpha.example.com',
            'type' => 'backlink',
        ]);

        $secondTarget = $project->link_urls()->create([
            'url' => 'https://beta.example.com',
            'type' => 'backlink',
        ]);

        Http::fake([
            'https://api.dataforseo.com/v3/serp/google/organic/task_post' => Http::response([
                'tasks' => [
                    [
                        'id' => 'task-alpha',
                        'status_code' => 20100,
                        'status_message' => 'Task Created.',
                        'data' => [
                            'tag' => (string) $firstTarget->id,
                        ],
                    ],
                    [
                        'id' => 'task-beta',
                        'status_code' => 20100,
                        'status_message' => 'Task Created.',
                        'data' => [
                            'tag' => (string) $secondTarget->id,
                        ],
                    ],
                ],
            ], 200),
        ]);

        $job = new ProcessLinkSubmissionChunkJob([$firstTarget->id, $secondTarget->id]);

        $job->handle(app(LinkService::class));

        Http::assertSentCount(1);
        Http::assertSent(function (\Illuminate\Http\Client\Request $request) use ($firstTarget, $secondTarget): bool {
            if ($request->url() !== 'https://api.dataforseo.com/v3/serp/google/organic/task_post') {
                return false;
            }

            $payload = $request->data();

            return count($payload) === 2
                && $payload[0]['tag'] === (string) $firstTarget->id
                && $payload[1]['tag'] === (string) $secondTarget->id;
        });

        $this->assertDatabaseCount('backlink_tasks', 2);
        $this->assertDatabaseHas('backlink_tasks', [
            'backlink_target_id' => $firstTarget->id,
            'task_id' => 'task-alpha',
        ]);
        $this->assertDatabaseHas('backlink_tasks', [
            'backlink_target_id' => $secondTarget->id,
            'task_id' => 'task-beta',
        ]);
    }
}
