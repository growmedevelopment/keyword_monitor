<?php

namespace App\Services;


use App\Models\Keyword;
use App\Models\LinkTarget;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class DashboardService{

    public function fetchGeneralData() : JsonResponse {

        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $projectsCount = Project::count();
        $keywordsCount = Keyword::count();
        $citationsCount = LinkTarget::where('type', 'citation')->count();
        $backlinksCount = LinkTarget::where('type', 'backlink')->count();

        return response()->json([
            'projects_amount' => $projectsCount,
            'keywords_amount' => $keywordsCount,
            'citations_amount' => $citationsCount,
            'backlinks_amount' => $backlinksCount,
            'message' => 'Dashboard metrics retrieved successfully.',
        ]);
    }

}
