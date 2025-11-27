<?php

namespace App\Http\Controllers;

use App\Models\BacklinkTask;
use App\Models\Project;
use App\Models\BacklinkTarget;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

//todo make  service for all these actions
class BacklinkController extends Controller
{
    /**
     * Return all backlink URLs for a project
     */
    public function index($projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);

        // eager load history
        $targets = $project->backlink_urls()
            ->with(['checks' => function ($q) {
                $q->orderBy('checked_at', 'desc');
            }])
            ->orderBy('id')
            ->get();

        // Format response for frontend
        $backlinks = $targets->map(function ($t) {

            $latest = $t->checks->first(); // newest record

            return [
                'id'    => $t->id,
                'url'   => $t->url,

                'latest_result' => $latest ? [
                    'http_code' => $latest->http_code,
                    'indexed'     => $latest->indexed,
                    'checked_at'  => $latest->checked_at,
                ] : (object)[],

                'history' => $t->checks->map(function ($h) {
                    return [
                        'http_code' => $h->http_code,
                        'indexed'     => $h->indexed,
                        'checked_at'  => $h->checked_at,
                    ];
                }),
            ];
        });

        return response()->json([
            'backlinks' => $backlinks
        ]);
    }

    /**
     * Add backlink URLs to a project
     */
    public function store(Request $request, $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);

        $request->validate([
            'urls' => 'required|array',
            'urls.*' => 'url|max:255',
        ]);

        $username = config('services.dataforseo.username');
        $password = config('services.dataforseo.password');

        $created = [];

        foreach ($request->urls as $url) {

            // 1) Save backlink target locally
            $target = $project->backlink_urls()->create([
                'url' => $url,
            ]);

            // 2) Prepare SERP "site:" task
            $payload = [
                [
                    "language_name" => "English",
                    "location_name" => "Canada",
                    "tag"          => $target->id,
                    "keyword"      => "site:{$url}",
                ]
            ];

            // 3) Submit to DataForSEO
            $response = Http::withBasicAuth($username, $password)
                ->post("https://api.dataforseo.com/v3/serp/google/organic/task_post", $payload)
                ->json();

            $taskInfo = $response['tasks'][0] ?? null;

            if ($taskInfo) {
                // 4) Save task in DB
                BacklinkTask::create([
                    'backlink_target_id' => $target->id,
                    'task_id'            => $taskInfo['id'],
                    'status_code'        => $taskInfo['status_code'],
                    'status_message'     => $taskInfo['status_message'],
                ]);
            }

            $created[] = $target;
        }

        return response()->json([
            'message' => 'Backlink URLs queued for indexing check.',
            'urls'    => $created,
        ], 201);
    }

    /**
     * Remove a backlink target
     */
    public function destroy(Project $project, BacklinkTarget $target): JsonResponse
    {
//        if ($target->project_id !== $project->id) {
//            return response()->json(['error' => 'Not allowed'], 403);
//        }
//
//        $target->checks()->delete();
//        $target->delete();
//
//        return response()->json([
//            'message' => 'Backlink URL removed successfully.'
//        ]);
    }


}
