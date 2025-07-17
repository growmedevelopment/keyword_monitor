<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\ProjectService;

class ProjectController extends Controller
{
    public function __construct(private ProjectService $projectService) {}

    public function index(): JsonResponse
    {
        return response()->json(ProjectResource::collection($this->projectService->getAll()));
    }

    public function store(Request $request): JsonResponse
    {

        dd($request->all());

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'ulr' => 'required|string|max:55',
        ]);

        $project = $this->projectService->create($data);

        return response()->json($project, 201);
    }

    public function show(Project $project): JsonResponse
    {
        return response()->json($this->projectService->show($project));
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
