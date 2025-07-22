<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\ProjectService;

class ProjectController extends Controller
{
    public function __construct(private ProjectService $projectService) {}

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
            'country'=> 'required|string|max:4',
        ]);

        $project = $this->projectService->create($data);

        return response()->json($project, 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        return response()->json($this->projectService->show($id));
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $updatedProject = $this->projectService->update($project, $data);

        return response()->json($updatedProject);
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->projectService->delete($project);

        return response()->json(['message' => 'Project deleted successfully.']);
    }

}
