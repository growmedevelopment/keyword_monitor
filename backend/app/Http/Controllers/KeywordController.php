<?php

namespace App\Http\Controllers;

use App\Http\Resources\KeywordRankResultResource;
use App\Models\Keyword;
use App\Models\Project;
use App\Services\DataForSeoResultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\KeywordSubmissionService;
use App\Enums\DataForSeoTaskStatus;

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



    /**
     * Add a new keyword to a project and submit it to the DataForSEO API for tracking.
     *
     * This method validates the incoming request, associates the keyword with the project,
     * submits it to DataForSEO for SERP analysis, and immediately attempts to fetch
     * initial results. If results are unavailable, the keyword is queued for
     * background polling.
     *
     * @param \Illuminate\Http\Request $request     The HTTP request containing the keyword input.
     * @param string                   $project_id  The ID of the project to which the keyword will be added.
     *
     * @return \Illuminate\Http\JsonResponse        JSON response with keyword details and status.
     *
     * @throws \Illuminate\Validation\ValidationException If the keyword validation fails.
     * @throws \Exception                                 If keyword submission or processing fails.
     */
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
            $keyword->status = $results->isNotEmpty() ? DataForSeoTaskStatus::COMPLETED : DataForSeoTaskStatus::QUEUED;

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

    public function show(Request $request, string $id): JsonResponse
    {
        $keyword = Keyword::with(['keywordsRank' => function ($query) {
            $query->orderBy('tracked_at', 'desc'); // Sort by tracked_at on keywords_rank
        }])->findOrFail($id);

        return response()->json([
            'id'            => $keyword->id,
            'keyword'       => $keyword->keyword,
            'keywords_rank' => KeywordRankResultResource::collection($keyword->keywordsRank),
        ]);
    }

}
