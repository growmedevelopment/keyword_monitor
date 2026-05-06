<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\LinkType;
use App\Jobs\ProcessLinkSubmissionChunkJob;
use App\Models\LinkTarget;
use App\Models\LinkTask;
use App\Models\Project;
use App\Services\DataForSeo\CredentialsService;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LinkService
{
    public const int SUBMISSION_BATCH_SIZE = 100;

    /**
     * Add unique URLs and queue DFS tasks in the background.
     *
     * @param  array<int, string>  $urls
     * @return array{
     *     added: array<int, array<string, mixed>>,
     *     skipped: array<int, string>
     * }
     */
    public function addUrls(Project $project, array $urls, string $type): array
    {
        $dbType = $this->resolveDatabaseType(LinkType::from($type));

        $incomingUrls = collect($urls)
            ->map(static fn (string $url): string => trim($url))
            ->filter(static fn (string $url): bool => $url !== '')
            ->unique()
            ->values();

        $existingUrls = $project->link_urls()
            ->where('type', $dbType)
            ->whereIn('url', $incomingUrls)
            ->pluck('url')
            ->all();

        $newUrls = $incomingUrls->diff($existingUrls)->values();
        $addedTargets = new EloquentCollection;

        foreach ($newUrls as $url) {
            $addedTargets->push($project->link_urls()->create([
                'url' => $url,
                'type' => $dbType,
            ]));
        }

        if ($addedTargets->isNotEmpty()) {
            ProcessLinkSubmissionChunkJob::dispatchForLinkTargetIds($addedTargets->modelKeys());
        }

        return [
            'added' => $addedTargets
                ->map(fn (LinkTarget $target): array => $this->transformLinkTarget($target, true))
                ->all(),
            'skipped' => array_values($existingUrls),
        ];
    }

    /**
     * Universal shared function to get targets by type.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function getLinksByType(Project $project, string $type): Collection
    {
        $targets = $project->link_urls()
            ->where('type', $type)
            ->withExists([
                'tasks as has_pending_task' => static fn ($query) => $query->whereNull('completed_at'),
            ])
            ->with([
                'checks' => static fn ($query) => $query->orderByDesc('checked_at'),
            ])
            ->orderBy('id')
            ->get();

        return $targets->map(
            fn (LinkTarget $target): array => $this->transformLinkTarget(
                target: $target,
                isChecking: (bool) $target->getAttribute('has_pending_task'),
            ),
        );
    }

    /**
     * Return only Backlinks.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function getBacklinkList(Project $project): Collection
    {
        return $this->getLinksByType($project, 'backlink');
    }

    /**
     * Return only Citations.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function getCitationList(Project $project): Collection
    {
        return $this->getLinksByType($project, 'citation');
    }

    public function checkBacklink(LinkTarget $target): void
    {
        $this->submitBacklinkBatch(new EloquentCollection([$target]));
    }

    /**
     * @param  EloquentCollection<int, LinkTarget>  $targets
     * @return array{success: bool, message: string}
     */
    public function submitBacklinkBatch(EloquentCollection $targets): array
    {
        if ($targets->isEmpty()) {
            return [
                'success' => true,
                'message' => 'No backlink targets to submit.',
            ];
        }

        try {
            $credentials = CredentialsService::get();
        } catch (\Throwable $exception) {
            Log::error('Failed to resolve DataForSEO credentials for backlink batch.', [
                'error' => $exception->getMessage(),
                'target_count' => $targets->count(),
            ]);

            return [
                'success' => false,
                'message' => 'Missing DataForSEO credentials.',
            ];
        }

        $payload = [];
        $targetsByTag = [];

        foreach ($targets as $target) {
            $payload[] = $this->buildTaskPayload($target);
            $targetsByTag[(string) $target->id] = $target;
        }

        try {
            $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
                ->post('https://api.dataforseo.com/v3/serp/google/organic/task_post', $payload);

            $json = $response->json();

            Log::info('DataForSEO batch response after submitting backlinks', [
                'target_count' => count($payload),
                'data' => $json,
            ]);

            if (! $response->successful() || ! isset($json['tasks']) || ! is_array($json['tasks'])) {
                Log::warning('Invalid backlink batch response from DataForSEO.', [
                    'response' => $json,
                ]);

                return [
                    'success' => false,
                    'message' => 'Invalid batch response from DataForSEO.',
                ];
            }

            foreach ($json['tasks'] as $task) {
                $tag = (string) ($task['data']['tag'] ?? '');

                if ($tag === '' || ! isset($targetsByTag[$tag])) {
                    Log::warning('Skipped backlink batch task because tag mapping is missing.', [
                        'task' => $task,
                    ]);

                    continue;
                }

                if (! isset($task['id'])) {
                    Log::warning('Skipped backlink batch task because task id is missing.', [
                        'task' => $task,
                    ]);

                    continue;
                }

                LinkTask::create([
                    'backlink_target_id' => $targetsByTag[$tag]->id,
                    'task_id' => $task['id'],
                    'status_code' => $task['status_code'] ?? null,
                    'status_message' => $task['status_message'] ?? null,
                    'raw_response' => json_encode($task, JSON_THROW_ON_ERROR),
                ]);
            }

            return [
                'success' => true,
                'message' => 'Backlink batch submitted successfully.',
            ];
        } catch (\Throwable $exception) {
            Log::error('Failed to submit backlink batch to DataForSEO.', [
                'error' => $exception->getMessage(),
                'target_count' => count($payload),
            ]);

            return [
                'success' => false,
                'message' => 'Exception occurred during backlink submission.',
            ];
        }
    }

    public function removeBacklink(LinkTarget $target): void
    {
        $target->delete();
    }

    protected function buildTaskPayload(LinkTarget $target): array
    {
        return [
            'language_name' => 'English',
            'location_name' => 'Canada',
            'tag' => (string) $target->id,
            'keyword' => "site:{$target->url}",
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function transformLinkTarget(LinkTarget $target, bool $isChecking): array
    {
        $checks = $target->relationLoaded('checks')
            ? $target->checks
            : $target->checks()->orderByDesc('checked_at')->get();

        $latest = $checks->first();

        return [
            'id' => $target->id,
            'url' => $target->url,
            'type' => $target->type,
            'is_checking' => $isChecking,
            'latest_result' => [
                'http_code' => $latest?->http_code,
                'indexed' => $latest?->indexed,
                'title' => $latest?->title,
                'checked_at' => $latest?->checked_at,
            ],
            'history' => $checks->map(static fn ($check): array => [
                'http_code' => $check->http_code,
                'indexed' => $check->indexed,
                'title' => $check->title,
                'checked_at' => $check->checked_at,
            ])->values()->all(),
        ];
    }

    protected function resolveDatabaseType(LinkType $type): string
    {
        return match ($type) {
            LinkType::Backlinks => 'backlink',
            LinkType::Citations => 'citation',
        };
    }
}
