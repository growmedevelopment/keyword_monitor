<?php

namespace App\Services;

use App\Models\Project;
use App\Models\BacklinkTarget;
use App\Models\BacklinkTask;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class BacklinkService
{
    /**
     * Return all backlink data for project (latest result + history)
     */
    public function getBacklinkList(Project $project)
    {
        $targets = $project->backlink_urls()
            ->with(['checks' => fn($q) => $q->orderBy('checked_at', 'desc')])
            ->orderBy('id')
            ->get();

        return $targets->map(function ($t) {
            $latest = $t->checks->first();
            $isChecking = $t->tasks()->whereNull('completed_at')->exists();

            return [
                'id'  => $t->id,
                'url' => $t->url,
                'is_checking' => $isChecking,

                'latest_result' => $latest ? [
                    'http_code'   => $latest->http_code,
                    'indexed'     => $latest->indexed,
                    'checked_at'  => $latest->checked_at,
                ] : (object)[],

                'history' => $t->checks->map(fn($h) => [
                    'http_code'  => $h->http_code,
                    'indexed'    => $h->indexed,
                    'title'      => $h->title,
                    'checked_at' => $h->checked_at,
                ]),
            ];
        });
    }

    /**
     * Add URLs and create DFS tasks
     */
    public function addUrls(Project $project, array $urls): array
    {
        $created = [];

        foreach ($urls as $url) {
            $target = $project->backlink_urls()->create([
                'url' => trim($url),
            ]);

            $this->checkBacklink($target);

            $created[] = $target;
        }

        return $created;
    }

    /**
     * Trigger a check for a single backlink target
     */
    public function checkBacklink(BacklinkTarget $target): void
    {
        $username = config('services.dataforseo.username');
        $password = config('services.dataforseo.password');

        $payload = $this->buildPayload($target);

        $response = Http::withBasicAuth($username, $password)
            ->post("https://api.dataforseo.com/v3/serp/google/organic/task_post", $payload)
            ->json();

        $task = $response['tasks'][0] ?? null;

        if ($task) {
            BacklinkTask::create([
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
    protected function buildPayload(BacklinkTarget $target): array
    {
        return [[
                    "language_name" => "English",
                    "location_name" => "Canada",
                    "tag"           => $target->id,
                    "keyword"       => "site:{$target->url}",
                ]];
    }

    public function removeBacklink(BacklinkTarget $target) {
        $target->delete();
    }
}
