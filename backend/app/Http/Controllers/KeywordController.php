<?php

namespace App\Http\Controllers;

use App\Http\Resources\KeywordRankResultResource;
use App\Models\Keyword;
use App\Models\Project;
use App\Services\KeywordMetricsService;
use App\Services\KeywordSubmissionService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Enums\DataForSeoTaskStatus;

class KeywordController extends Controller
{
    protected KeywordSubmissionService $keywordSubmissionService;
    protected KeywordMetricsService $keywordMetricsService;

    public function __construct(
        KeywordSubmissionService $keywordSubmissionService,
        KeywordMetricsService $keywordMetricsService
    ) {
        $this->keywordSubmissionService = $keywordSubmissionService;
        $this->keywordMetricsService = $keywordMetricsService;
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
                'keywords' => 'required|array',
                'keywords.*' => 'string|max:255',
                'keyword_group_id' => 'nullable|exists:keyword_groups,id',
            ]);

            $project = Project::findOrFail($project_id);
            $groupId = $request->input('keyword_group_id');

            $createdKeywords = [];

            foreach ($request->keywords as $keywordText) {

                $keywordText = strtolower(trim($keywordText));

                // Check if keyword already exists
                $existing = $project->keywords()
                    ->where('keyword', $keywordText)
                    ->first();

                if ($existing) {
                    $createdKeywords[] = array_merge(
                        $existing->toArray(),
                        [
                            'keyword_group_name'  => $existing->keyword_groups?->name,
                            'keyword_group_color' => $existing->keyword_groups?->color,
                            'already_exists'      => true,
                        ]
                    );
                    continue;
                }

                // Create keyword + submit to DataForSEO
                $keyword = $this->keywordSubmissionService->submitKeyword(
                    $project,
                    $keywordText,
                    $groupId
                );

                $createdKeywords[] = array_merge(
                    $keyword->toArray(),
                    [
                        'keyword_group_name'  => $keyword->keyword_groups?->name,
                        'keyword_group_color' => $keyword->keyword_groups?->color,
                    ]
                );
            }

            return response()->json([
                'message'  => 'Keywords processed.',
                'keywords' => $createdKeywords,
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $keyword = Keyword::with([
            'keywordsRank' => function ($query) {$query->orderBy('tracked_at', 'desc');},
            'keyword_groups',

        ])->findOrFail($id);

        return response()->json([
            'id'            => $keyword->id,
            'project_id'    => $keyword->project_id,
            'keyword_groups' => $keyword->keyword_groups,
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
                'message' => 'keyword and all related results have been deleted'
            ]);
        }catch (\Exception $e) {
            return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage()]
                , 500);
        }
    }

    public function filteredResults(Request $request, string $id): JsonResponse {
        $mode = $request->input('mode', 'range');

        $startDate = $request->input('date_range.start_date');
        $endDate   = $request->input('date_range.end_date');

        if (!$startDate || !$endDate) {
            return response()->json(['error' => 'Missing date range'], 422);
        }

        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();


        $keyword = Keyword::with(['keywordsRank' => function ($q) use ($mode, $start, $end, $startDate, $endDate) {

            if ($mode === 'range') {
                $q->whereBetween('tracked_at', [$start, $end]);
            }

            if ($mode === 'compare') {
                $q->where(function ($query) use ($startDate, $endDate) {
                    $query->whereDate('tracked_at', '=', $startDate)
                        ->orWhereDate('tracked_at', '=', $endDate);
                });
            }

            $q->orderBy('tracked_at', 'asc');
        }])->findOrFail($id);

        return response()->json($keyword);
    }


}



