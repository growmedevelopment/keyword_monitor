<?php

namespace App\Services;

use App\Enums\LinkType;
use App\Models\Project;
use App\Models\LinkTarget;
use App\Models\LinkTask;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Http;

class LinkService
{
    /**
     * Add unique URLs and create DFS tasks.
     * Skips URLs that already exist for this project and type.
     */
    public function addUrls(Project $project, array $urls, string $type): array
    {
        // 1. Resolve Type
        $enum = LinkType::tryFrom($type);
        // Fallback or throw error if invalid type (though validation catches this)
        $dbType = match($enum) {
            LinkType::Backlinks => 'backlink',
            LinkType::Citations => 'citation',
            default => 'backlink'
        };

        // 2. Normalize Input
        $incomingUrls = collect($urls)->map(fn($u) => trim($u))->unique();

        // 3. Find Existing URLs in DB (for this project & type)
        $existingUrls = $project->link_urls()
            ->where('type', $dbType)
            ->whereIn('url', $incomingUrls)
            ->pluck('url')
            ->toArray();

        // 4. Calculate New URLs (Diff)
        $newUrls = $incomingUrls->diff($existingUrls);

        $addedModels = [];

        // 5. Create & Trigger Checks for NEW URLs only
        foreach ($newUrls as $url) {
            /** @var LinkTarget $target */
            $target = $project->link_urls()->create([
                'url'  => $url,
                'type' => $dbType,
            ]);

            // Trigger the external API check immediately
            $this->checkBacklink($target);

            $addedModels[] = $target;
        }

        // 6. Return structured result
        return [
            'added'   => $addedModels,
            'skipped' => $existingUrls, // List of URLs that were duplicates
        ];
    }

    /**
     * Universal shared function to get targets by type
     */
    public function getLinksByType(Project $project, string $type): Collection|\Illuminate\Support\Collection {
        // We filter by the 'type' column here
        $targets = $project->link_urls()
            ->where('type', $type)
            ->with(['checks' => fn($q) => $q->orderBy('checked_at', 'desc')])
            ->orderBy('id')
            ->get();

        return $targets->map(function ($t) {
            $latest = $t->checks->first();
            $isChecking = $t->tasks()->whereNull('completed_at')->exists();

            return [
                'id'            => $t->id,
                'url'           => $t->url,
                'type'          => $t->type, // Useful to see in the response
                'is_checking'   => $isChecking,

                'latest_result' => $latest ? [
                    'http_code'   => $latest->http_code,
                    'indexed'     => $latest->indexed,
                    'checked_at'  => $latest->checked_at,
                ] : (object)[],

                'history'       => $t->checks->map(fn($h) => [
                    'http_code'  => $h->http_code,
                    'indexed'    => $h->indexed,
                    'title'      => $h->title ?? null, // Added null check safety
                    'checked_at' => $h->checked_at,
                ]),
            ];
        });
    }

    /**
     * Return only Backlinks
     */
    public function getBacklinkList(Project $project): Collection|\Illuminate\Support\Collection {
        return $this->getLinksByType($project, 'backlink');
    }

    /**
     * Return only Citations
     */
    public function getCitationList(Project $project): Collection|\Illuminate\Support\Collection {
        return $this->getLinksByType($project, 'citation');
    }

    /**
     * Trigger a check for a single backlink target
     */
    public function checkBacklink(LinkTarget $target): void
    {
        $username = config('services.dataforseo.username');
        $password = config('services.dataforseo.password');

        $payload = $this->buildPayload($target);

        $response = Http::withBasicAuth($username, $password)
            ->post("https://api.dataforseo.com/v3/serp/google/organic/task_post", $payload)
            ->json();

        $task = $response['tasks'][0] ?? null;

        if ($task) {
            LinkTask::create([
                'backlink_target_id' => $target->id,
                'task_id'            => $task['id'],
                'status_code'        => $task['status_code'],
                'status_message'     => $task['status_message'],
            ]);
        }
    }

    /**
     * Build DFS payload
     */
    protected function buildPayload(LinkTarget $target): array
    {
        return [[
                    "language_name" => "English",
                    "location_name" => "Canada",
                    "tag"           => $target->id,
                    "keyword"       => "site:{$target->url}",
                ]];
    }

    /**
     * Remove a backlink target from the project
     */
    public function removeBacklink(LinkTarget $target): void {
        $target->delete();
    }

}
