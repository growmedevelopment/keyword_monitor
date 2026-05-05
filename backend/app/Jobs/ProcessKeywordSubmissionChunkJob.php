<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Keyword;
use App\Services\KeywordSubmissionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ProcessKeywordSubmissionChunkJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public const int DEFAULT_CHUNK_SIZE = KeywordSubmissionService::SERP_BATCH_SIZE;

    public const int DELAY_BETWEEN_CHUNKS_SECONDS = 2;

    public int $timeout = 900;

    /**
     * @param  array<int>  $keywordIds
     */
    public function __construct(
        public array $keywordIds,
        public bool $shouldRefreshSearchVolume = true,
    ) {}

    /**
     * @param  array<int>  $keywordIds
     */
    public static function dispatchForKeywordIds(array $keywordIds, bool $shouldRefreshSearchVolume = true): void
    {
        collect($keywordIds)
            ->map(static fn (int $keywordId): int => $keywordId)
            ->filter(static fn (int $keywordId): bool => $keywordId > 0)
            ->values()
            ->chunk(self::DEFAULT_CHUNK_SIZE)
            ->each(function (Collection $chunk, int $index) use ($shouldRefreshSearchVolume): void {
                self::dispatch($chunk->all(), $shouldRefreshSearchVolume)
                    ->delay(now()->addSeconds($index * self::DELAY_BETWEEN_CHUNKS_SECONDS));
            });
    }

    public function handle(KeywordSubmissionService $submissionService): void
    {
        $keywords = Keyword::query()
            ->with('project')
            ->whereIn('id', $this->keywordIds)
            ->get()
            ->keyBy('id');

        $keywordsToProcess = new EloquentCollection;

        foreach ($this->keywordIds as $keywordId) {
            /** @var Keyword|null $keyword */
            $keyword = $keywords->get($keywordId);

            if ($keyword === null) {
                Log::warning('Skipped keyword submission because keyword is missing.', [
                    'keyword_id' => $keywordId,
                ]);

                continue;
            }

            if ($keyword->last_submitted_at?->isToday() === true) {
                Log::info("⏭️ Skipped Keyword ID {$keyword->id} — already submitted today.");

                continue;
            }

            $keywordsToProcess->push($keyword);
        }

        if ($keywordsToProcess->isEmpty()) {
            return;
        }

        Log::info('🚀 Processing keyword submission batch.', [
            'keyword_count' => $keywordsToProcess->count(),
            'refresh_search_volume' => $this->shouldRefreshSearchVolume,
        ]);

        $submissionService->submitKeywordBatch(
            keywords: $keywordsToProcess,
            shouldRefreshSearchVolume: $this->shouldRefreshSearchVolume,
        );

        Log::info('✅ Finished keyword submission batch.', [
            'keyword_count' => $keywordsToProcess->count(),
        ]);
    }
}
