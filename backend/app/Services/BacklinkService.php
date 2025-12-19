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

            return [
                'id'  => $t->id,
                'url' => $t->url,

                'latest_result' => $latest ? [
                    'http_code'   => $latest->http_code,
                    'indexed'     => $latest->indexed,
                    'checked_at'  => $latest->checked_at,
                ] : (object)[],

                'history' => $t->checks->map(fn($h) => [
                    'http_code'  => $h->http_code,
                    'indexed'    => $h->indexed,
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
        $username = config('services.dataforseo.username');
        $password = config('services.dataforseo.password');

        $created = [];

        foreach ($urls as $url) {
            $target = $project->backlink_urls()->create([
                'url' => trim($url),
            ]);

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

            $created[] = $target;
        }

        return $created;
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
