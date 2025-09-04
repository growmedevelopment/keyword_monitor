<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(protected DashboardService $dashboardService) {}

    public function index(Request $request): JsonResponse {
        try {
            return $this->dashboardService->fetchGeneralData($request);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch locations.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
