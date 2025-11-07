<?php

namespace App\Services;

use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class KeywordMetricsService
{
    /**
     * Get SEO metrics (average position, daily trend, comparison with previous period)
     * for all keywords belonging to a project.
     *
     * @param int $projectId
     * @param string $startDate
     * @param string $endDate
     * @return array
     */
    public function getSeoMetrics(int $projectId, string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Determine previous period (same length before start)
        $previousStart = $start->copy()->subDays($start->diffInDays($end) + 1);
        $previousEnd = $start->copy()->subDay();

        // 1. Get current period data
        $currentData = $this->collectRankData($projectId, $start, $end);
        $previousData = $this->collectRankData($projectId, $previousStart, $previousEnd);

        if ($currentData['ranks']->isEmpty()) {
            return [
                'average_position' => 0,
                'position_delta' => 0,
                'tracked_keywords' => 0,
                'chart_data' => [],
                'message' => 'No valid rank data found for this period.',
            ];
        }

        // 2. Prepare chart data
        $chartData = $this->prepareChartData($currentData['ranks']);

        // 3. Calculate averages and change
        $averagePosition = round($currentData['ranks']->avg('position'), 1);
        $previousAverage = $previousData['ranks']->isNotEmpty()
            ? round($previousData['ranks']->avg('position'), 1)
            : $averagePosition;

        $delta = round($previousAverage - $averagePosition, 1); // positive if improved (lower rank)

        return [
            'average_position' => $averagePosition,
            'position_delta' => $delta,
            'tracked_keywords' => $currentData['keyword_count'],
            'chart_data' => $chartData,
        ];
    }

    /**
     * Fetch all rank data for a project within a date range.
     */
    private function collectRankData(int $projectId, Carbon $start, Carbon $end): array
    {
        $project = Project::with([
            'keywords.keywordsRank' => function ($query) use ($start, $end) {
                $query->whereBetween('tracked_at', [$start, $end])
                    ->orderBy('tracked_at');
            },
        ])->findOrFail($projectId);

        $keywords = $project->keywords;

        $ranks = $keywords
            ->flatMap(fn($keyword) => $keyword->keywordsRank)
            ->filter(fn($r) => isset($r->position) && is_numeric($r->position));

        return [
            'ranks' => $ranks,
            'keyword_count' => $keywords->count(),
        ];
    }

    /**
     * Group ranks by date and compute average positions for the chart.
     */
    private function prepareChartData(Collection $ranks): Collection
    {
        $grouped = $ranks->groupBy(fn($rank) => Carbon::parse($rank->tracked_at)->toDateString());

        return $grouped->map(function (Collection $items, string $date) {
            $avg = $items->avg('position');
            return [
                'date' => Carbon::parse($date)->format('M j'),
                'avg_position' => round($avg),
            ];
        })->values();
    }
}
