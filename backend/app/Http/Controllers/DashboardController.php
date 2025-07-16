<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\DataForSeoResult;
use App\Models\DataForSeoTask;
use App\Models\Project;

class DashboardController extends Controller
{
    public function index()
    {
        $projects = DataForSeoTask::select('project_name')
            ->withCount('results')
            ->get()
            ->map(function ($task) {
                return [
                    'name' => $task->project_name,
                    'taskCount' => $task->results_count,
                ];
            });

        $topKeywords = DataForSeoResult::orderBy('rank_absolute')
            ->limit(10)
            ->get(['url', 'rank_absolute as rank', 'title']);

        return Inertia::render('Dashboard', [
            'projects' => $projects,
            'topKeywords' => $topKeywords,
        ]);
    }
}
