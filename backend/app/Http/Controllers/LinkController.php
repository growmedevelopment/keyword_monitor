<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\LinkType;
use App\Models\LinkTarget;
use App\Models\Project;
use App\Services\LinkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LinkController extends Controller
{
    public function __construct(
        protected LinkService $linkService,
    ) {}

    public function index(Request $request, string $projectId, string $type): JsonResponse
    {
        $project = Project::query()->findOrFail($projectId);
        $dbType = match (LinkType::from($type)) {
            LinkType::Backlinks => 'backlink',
            LinkType::Citations => 'citation',
        };

        return response()->json($this->linkService->getLinksByType($project, $dbType));
    }

    public function store(Request $request, string $projectId): JsonResponse
    {
        $request->validate([
            'urls' => 'required|array|min:1',
            'urls.*' => 'required|url|max:255|distinct',
            'type' => 'required|string|in:backlinks,citations',
        ]);

        $project = Project::query()->findOrFail($projectId);
        $result = $this->linkService->addUrls($project, $request->urls, $request->type);

        return response()->json([
            'message' => 'URLs added and queued for checking.',
            'data' => [
                'added_count' => count($result['added']),
                'skipped_count' => count($result['skipped']),
                'added_urls' => $result['added'],
                'skipped_urls' => $result['skipped'],
            ],
        ], 201);
    }

    public function destroy(string $projectId, string $id): JsonResponse
    {
        try {
            $backlink = LinkTarget::query()->findOrFail($id);

            $this->linkService->removeBacklink($backlink);

            return response()->json([
                'status' => 'success',
                'message' => 'Link has been deleted',
            ]);
        } catch (\Throwable $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 500);
        }
    }

    public function reCheckAllLinks(Request $request, string $projectId): JsonResponse
    {
        $project = Project::query()->findOrFail($projectId);
        $projectLinks = $request->type === 'citations'
            ? $project->citations()->get()
            : $project->backlinks()->get();

        $projectLinks->each(function (LinkTarget $link): void {
            $this->linkService->checkBacklink($link);
        });

        return response()->json([
            'message' => 'All links have been rechecked.',
        ]);
    }
}
