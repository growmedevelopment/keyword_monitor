<?php

namespace App\Http\Controllers;

use App\Models\BacklinkTarget;
use App\Models\Project;
use App\Services\BacklinkService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BacklinkController extends Controller
{
    protected BacklinkService $service;

    public function __construct(BacklinkService $service)
    {
        $this->service = $service;
    }

    public function index($projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);
        $backlinks = $this->service->getBacklinkList($project);

        return response()->json(['backlinks' => $backlinks]);
    }

    public function store(Request $request, $projectId): JsonResponse
    {
        $request->validate([
            'urls' => 'required|array',
            'urls.*' => 'url|max:255',
        ]);

        $project = Project::findOrFail($projectId);

        $created = $this->service->addUrls($project, $request->urls);

        return response()->json([
            'message' => 'Backlink URLs queued for indexing check.',
            'urls'    => $created,
        ], 201);
    }

    public function destroy(string $id):JsonResponse {

        try {
            $backlink = BacklinkTarget::findOrFail($id);

            $this->service->removeBacklink($backlink);

            return response()->json([
                'status' => 'success',
                'message' => 'Backlink has been deleted'
            ]);
        }catch (\Exception $e) {
            return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage()]
                , 500);
        }

    }
}
