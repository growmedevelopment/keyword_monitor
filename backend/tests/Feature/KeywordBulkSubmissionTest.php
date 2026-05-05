<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\ProcessKeywordSubmissionChunkJob;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

        Queue::assertPushed(ProcessKeywordSubmissionChunkJob::class, 6);

        $queuedKeywordCount = 0;

        Queue::assertPushed(ProcessKeywordSubmissionChunkJob::class, function (ProcessKeywordSubmissionChunkJob $job) use (&$queuedKeywordCount): bool {
            $queuedKeywordCount += count($job->keywordIds);

            return count($job->keywordIds) <= ProcessKeywordSubmissionChunkJob::DEFAULT_CHUNK_SIZE
                && $job->shouldRefreshSearchVolume === true;
        });

        $this->assertSame(130, $queuedKeywordCount);
    }
}
