<?php

namespace App\Http\Controllers;

use App\Models\KeywordGroup;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KeywordGroupController extends Controller {

    public function index(): JsonResponse {
        $groups = KeywordGroup::all();
        return response()->json($groups);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'project_id' => 'required|integer|exists:projects,id',
                'name'       => 'required|string',
                'color'      => ['required', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            ]);

            $project = Project::findOrFail($data['project_id']);


            $keywordGroup = $project->keyword_groups()->firstOrCreate(
                ['name' => $data['name']],
                ['color' => $data['color']]
            );

            return response()->json([
                'keyword_group' => $keywordGroup,
                'message'       => 'Keyword group created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Failed to create keyword group',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse {
        $group = KeywordGroup::findOrFail($id);

        $group->keywords()->update(['keyword_group_id' => NULL]);

        $group->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Keyword group deleted and relations detached',
        ]);
    }

    public function getProjectKeywordGroups(int $project_id): JsonResponse {
        $groups = KeywordGroup::where('project_id', $project_id)->get();
        return response()->json($groups);
    }

}
