<?php

namespace App\Http\Controllers;

use App\Services\SerpLocationService;
use Illuminate\Http\JsonResponse;

class SerpLocationController extends Controller
{
    public function __construct(protected SerpLocationService $locationService) {}

    public function index(): JsonResponse
    {
        try {
            $data = $this->locationService->fetchLocations();
            dd($data);
            return response()->json($data);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch locations.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
