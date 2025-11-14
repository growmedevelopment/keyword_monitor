<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\ProjectService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProjectController extends Controller
{
    protected ProjectService $projectService;

    public function __construct(ProjectService $projectService) {
        $this->projectService = $projectService;
    }

    /**
     * @throws \Exception
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        return response()->json($this->projectService->getAllByUser($user));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id'=>'integer|required',
            'name' => 'required|string|max:255',
            'url' => 'required|url|max:255',
            'location_code' => 'required|integer',
            'location_name' => 'required|string|max:255',
            'country'=> 'required|string|max:4',
        ]);

        $project = $this->projectService->create($data);

        return response()->json($project, 201);
    }

    public function show(Request $request, $id): JsonResponse
    {

        $project = $this->projectService->show( $request, $id);

        return response()->json($project);
    }

    public function destroy(int $project_id): JsonResponse
    {
        $this->projectService->delete($project_id);

        return response()->json(['message' => 'Project deleted successfully.']);
    }

    public function archived(): JsonResponse{
        $user = auth()->user();
        return response()->json($this->projectService->getAllArchivedByUser($user));
    }

    public function restore(int $project_id): JsonResponse
    {
        $this->projectService->restore($project_id);

        return response()->json(['message' => 'Project has been restored successfully.']);
    }


}
