<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

use App\Services\KeywordSubmissionService;

class KeywordController extends Controller
{
    public function __construct(private KeywordSubmissionService $keywordSubmissionService ) {}

    public function addKeywordToProject(Request $request, string $project_id): void
    {
        try {
            $project = Project::findOrFail($project_id);
            $new_keyword = $request->input('keyword');

            $this->keywordSubmissionService->submitUnprocessedKeywords($project, $new_keyword);
//            return response()->json(['message' => 'Keywords submitted successfully.']);
        } catch (\Exception $e) {
//            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
