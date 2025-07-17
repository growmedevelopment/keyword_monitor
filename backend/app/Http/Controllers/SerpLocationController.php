<?php

namespace App\Http\Controllers;

use App\Services\SerpLocationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SerpLocationController extends Controller
{
    public function __construct(protected SerpLocationService $locationService) {}

    public function index(Request $request): JsonResponse
    {
        try {
            return $this->locationService->fetchLocations($request);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch locations.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
