<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\LinkTarget;
use App\Services\LinkService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ProcessLinkSubmissionChunkJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public const int DEFAULT_CHUNK_SIZE = LinkService::SUBMISSION_BATCH_SIZE;

    public int $timeout = 900;

    /**
     * @param  array<int>  $linkTargetIds
     */
    public function __construct(
        public array $linkTargetIds,
    ) {}

    /**
     * @param  array<int>  $linkTargetIds
     */
    public static function dispatchForLinkTargetIds(array $linkTargetIds): void
    {
        collect($linkTargetIds)
            ->map(static fn (int $linkTargetId): int => $linkTargetId)
            ->filter(static fn (int $linkTargetId): bool => $linkTargetId > 0)
            ->values()
            ->chunk(self::DEFAULT_CHUNK_SIZE)
            ->each(function (Collection $chunk): void {
                if (config('queue.default') === 'sync') {
                    self::dispatchAfterResponse($chunk->all());

                    return;
                }

                self::dispatch($chunk->all());
            });
    }

    public function handle(LinkService $linkService): void
    {
        $targets = LinkTarget::query()
            ->whereIn('id', $this->linkTargetIds)
            ->get()
            ->keyBy('id');

        $targetsToProcess = new EloquentCollection;

        foreach ($this->linkTargetIds as $linkTargetId) {
            /** @var LinkTarget|null $target */
            $target = $targets->get($linkTargetId);

            if ($target === null) {
                Log::warning('Skipped backlink submission because target is missing.', [
                    'link_target_id' => $linkTargetId,
                ]);

                continue;
            }

            $targetsToProcess->push($target);
        }

        if ($targetsToProcess->isEmpty()) {
            return;
        }

        Log::info('Processing backlink submission batch.', [
            'target_count' => $targetsToProcess->count(),
        ]);

        $linkService->submitBacklinkBatch($targetsToProcess);

        Log::info('Finished backlink submission batch.', [
            'target_count' => $targetsToProcess->count(),
        ]);
    }
}
