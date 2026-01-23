<?php

namespace App\Http\Controllers;

use App\Enums\LinkType;
use App\Models\LinkTarget;
use App\Models\Project;
use App\Services\LinkService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class LinkController extends Controller
{
    protected LinkService $linkService;

    public function __construct(LinkService $service)
    {
        $this->linkService = $service;
    }


    public function index(Request $request,  $projectId, string $type): JsonResponse {

        $project = Project::findOrFail($projectId);
        $enum = LinkType::tryFrom($type);
        $dbType = match($enum) {
            LinkType::Backlinks => 'backlink',
            LinkType::Citations => 'citation',
        };

        $data = $this->linkService->getLinksByType($project, $dbType);

        return response()->json($data);
    }

    public function store(Request $request, $projectId): JsonResponse
    {
        $request->validate([
            'urls' => 'required|array',
            'urls.*' => 'url|max:255',
            'type' => 'required|string|in:backlinks,citations',
        ]);

        $project = Project::findOrFail($projectId);

        $created = $this->linkService->addUrls($project, $request->urls, $request->type);

        return response()->json([
            'message' => 'Link URLs queued for indexing check.',
            'urls'    => $created,
        ], 201);
    }

    public function destroy(string $projectId , string $id):JsonResponse {

        try {
            $backlink = LinkTarget::findOrFail($id);

            $this->linkService->removeBacklink($backlink);

            return response()->json([
                'status' => 'success',
                'message' => 'Link has been deleted',
            ]);
        }catch (\Exception $e) {
            return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage()]
                , 500);
        }

    }

    public function reCheckAllLinks (Request $request, $projectId): JsonResponse {

        $project = Project::findOrFail($projectId);
        $project_links = $project->backlinks()->get();
        if ($request->type === 'citations') {
            $project_links = $project->citations()->get();
        }

        $project_links->each(function ($link) {
            $this->linkService->checkBacklink($link);
        });

        return response()->json(
            ['message' => 'All links have been rechecked.']
        );
    }
}
