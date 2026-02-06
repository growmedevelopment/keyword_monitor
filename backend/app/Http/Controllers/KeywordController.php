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

    public function addKeywordToProject(Request $request, string $project_id): JsonResponse
    {
        try {
            $request->validate([
                'keywords'      => 'required|array|min:1',
                'keywords.*'    => 'required|string|max:255',
                'keyword_groups' => 'nullable|array',
                'keyword_groups.*' => 'integer|exists:keyword_groups,id',
            ]);

            $project = Project::findOrFail($project_id);
            $groupIds = $request->input('keyword_groups', []);

            // 1. Normalize & Deduplicate Input
            $incomingKeywords = collect($request->keywords)
                ->map(fn($k) => strtolower(trim($k)))
                ->unique();

            // 2. Find Duplicates in Database
            $existingKeywords = $project->keywords()
                ->whereIn('keyword', $incomingKeywords)
                ->pluck('keyword')
                ->toArray();

            // 3. Calculate New Keywords
            $newKeywords = $incomingKeywords->diff($existingKeywords);

            $addedKeywords = [];

            // 4. Process Only New Keywords
            foreach ($newKeywords as $keywordText) {

                $keyword = $this->keywordSubmissionService->submitKeyword(
                    $project,
                    $keywordText,
                    $groupIds
                );

                $keyword->load('keyword_groups');

                $addedKeywords[] = array_merge(
                    $keyword->toArray(),
                    [
                        'keyword_groups' => $keyword->keyword_groups->map(fn($g) => [
                            'id'    => $g->id,
                            'name'  => $g->name,
                            'color' => $g->color,
                        ]),
                    ]
                );
            }

            return response()->json([
                'message' => 'Keywords processed.',
                'data'    => [
                    'added_count'      => count($addedKeywords),
                    'skipped_count'    => count($existingKeywords),
                    'added_keywords'   => $addedKeywords,
                    'skipped_keywords' => $existingKeywords,
                ],
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
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
                'message' => 'keyword and all related results have been deleted',
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

    /**
     * Get only the IDs of the groups assigned to the keyword.
     * This is used by the frontend to set the "originalGroupsRef" baseline.
     */
    public function getAssignedGroups(Request $request, string $id): JsonResponse
    {
        $keyword = Keyword::findOrFail($id);

        $assignedIds = $keyword->keyword_groups()->pluck('keyword_groups.id');

        return response()->json($assignedIds);
    }

}



