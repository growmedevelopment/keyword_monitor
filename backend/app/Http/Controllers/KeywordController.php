<?php

namespace App\Http\Controllers;

use App\Http\Resources\KeywordRankResultResource;
use App\Models\Keyword;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\KeywordSubmissionService;
use App\Enums\DataForSeoTaskStatus;

class KeywordController extends Controller
{
    protected KeywordSubmissionService $keywordSubmissionService;

    public function __construct(KeywordSubmissionService $keywordSubmissionService) {
        $this->keywordSubmissionService = $keywordSubmissionService;
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

            // 2. Check if keyword already exists for this project
            $existingKeyword = $project->keywords()
                ->where('keyword', $request->input('keyword'))
                ->first();

            // 2a. If it exists and has a pending task without result, return 202
            if ($existingKeyword) {
                $hasPendingTask = $existingKeyword->dataForSeoTasks()
                    ->where('status', DataForSeoTaskStatus::SUBMITTED)
                    ->whereDoesntHave('result')
                    ->exists();

                if ($hasPendingTask) {
                    return response()->json([
                        'message' => 'Keyword already submitted and waiting for results.',
                        'keyword' => $existingKeyword->load('dataForSeoResults'),
                    ], 202);
                }

                return response()->json([
                    'message' => 'Keyword already exists in the project.',
                    'keyword' => $existingKeyword->load('dataForSeoResults'),
                ], 200);
            }

            // 3. Submit keyword & create DataForSeoTask
            $keyword = $this->keywordSubmissionService->submitKeyword(
                $project,
                $request->input('keyword')
            );

            return response()->json([
                'message' => 'Keyword added and queued for background processing.',
                'keyword' => $keyword,
                'status' => DataForSeoTaskStatus::QUEUED,
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

    public function destroy (Request $request, string $id):JsonResponse {

        try {
            $keyword = Keyword::findOrFail($id);

            $this->keywordSubmissionService->removeKeyword($keyword);

            return response()->json([
                'status' => 'success',
                'message' => 'keyword and all related results has been deleted'
            ]);
        }catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()]
                , 500);
        }
    }

}
