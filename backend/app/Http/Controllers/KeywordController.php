<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Services\KeywordSubmissionService;

class KeywordController extends Controller
{
    public function __construct(private readonly KeywordSubmissionService $keywordSubmissionService ) {}

    public function addKeywordToProject(Request $request, string $project_id): JsonResponse {
        try {
            $request->validate([
                'keyword' => 'required|string|max:255',
            ]);

            $project = Project::findOrFail($project_id);
            $keyword = $this->keywordSubmissionService->submitKeyword($project, $request->input('keyword'));

            return response()->json([
                'message' => 'Keyword has been added successfully.',
                'keyword' => $keyword,
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
