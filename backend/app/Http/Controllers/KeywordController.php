<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\DataForSeoResultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\KeywordSubmissionService;

class KeywordController extends Controller
{
    protected KeywordSubmissionService $keywordSubmissionService;
    protected DataForSeoResultService $seoResultService;

    public function __construct(
        KeywordSubmissionService $keywordSubmissionService,
        DataForSeoResultService $seoResultService
    ) {
        $this->keywordSubmissionService = $keywordSubmissionService;
        $this->seoResultService = $seoResultService;
    }

    public function addKeywordToProject(Request $request, string $project_id): JsonResponse
    {
        try {
            $request->validate([
                'keyword' => 'required|string|max:255',
            ]);

            // 1. Find project
            $project = Project::findOrFail($project_id);

            // 2. Submit keyword & create DataForSeoTask
            $keyword = $this->keywordSubmissionService->submitKeyword(
                $project,
                $request->input('keyword')
            );

            // 3. Try hybrid fetch (immediate first, otherwise queued job)
            $results = $this->seoResultService->fetchSEOResultsByKeyword($keyword);

            // 4. Attach results for response
            $keyword->setRelation('dataForSeoResults', $results);

            //normalize to 'results' key for API
            $keyword->results = $results; // rename for frontend
            $keyword->makeHidden('dataForSeoResults');

            // 5. Add status to response object
            $keyword->status = $results->isNotEmpty() ? 'Completed' : 'Queued';

            return response()->json([
                'message' => $results->isNotEmpty()
                    ? 'Keyword added and results ready.'
                    : 'Keyword added and queued for background processing.',
                'keyword' => $keyword,
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
