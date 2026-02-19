<?php

namespace App\Http\Controllers;

use App\Enums\DataForSeoTaskStatus;
use App\Jobs\PollBacklinkTaskJob;
use App\Models\LinkTask;
use App\Services\SearchValueService;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller{

    protected SearchValueService $searchValueService;

    public function __construct(SearchValueService $searchValueService)
    {
        $this->searchValueService = $searchValueService;
    }

    public function checkPendingTasks(): JsonResponse {
        // Check if there are any tasks waiting to be updated
        $count = LinkTask::where('status_code', DataForSeoTaskStatus::SUBMITTED)->count();

        return response()->json([
            'pending_count' => $count,
            'has_pending' => $count > 0,
        ]);
    }

    public function updateCreatedDataForSEOTasks(): JsonResponse {

        // 1. Find all tasks that are currently 'SUBMITTED'
        $tasks = LinkTask::where('status_code', DataForSeoTaskStatus::SUBMITTED)->get();

        // 2. Loop through them and dispatch a job for each
        foreach ($tasks as $task) {
            // Dispatch the job to the queue (so the browser doesn't freeze)
            PollBacklinkTaskJob::dispatch($task);
        }

        // 3. Return success to the frontend
        return response()->json([
            'message' => 'Update started',
        ]);
    }

    public function getAllKeywordsSearchVolume (): JsonResponse {

        $summary = $this->searchValueService->refreshAllKeywordsSearchVolume();

        return response()->json([
            'message' => 'Search Volume task creation process finished.',
            'summary' => $summary,
        ]);
    }
}
