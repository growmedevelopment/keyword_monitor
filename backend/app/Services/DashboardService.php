<?php

namespace App\Services;


use Illuminate\Http\JsonResponse;

class DashboardService{

    public function fetchGeneralData() : JsonResponse {

        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $projectsCount = $user->projects()->count();
        $keywordsCount = $user->projects()
            ->withCount('keywords')
            ->get()
            ->sum('keywords_count');


        return response()->json([
            'projects_amount' => $projectsCount,
            'keywords_amount' => $keywordsCount,
            'message' => 'Dashboard metrics retrieved successfully.',
        ]);
    }

}
