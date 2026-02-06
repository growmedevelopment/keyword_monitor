<?php

namespace App\Http\Controllers;

use App\Events\KeywordGroupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KeywordGroupController extends Controller
{
    protected KeywordGroupService $service;

    public function __construct(KeywordGroupService $service)
    {
        $this->service = $service;
    }

    public function index(): JsonResponse
    {
        return response()->json($this->service->getAllGroups());
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'project_id' => 'required|integer|exists:projects,id',
                'name'       => 'required|string',
                'color'      => ['required', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            ]);

            $keywordGroup = $this->service->createGroup($data);

            return response()->json([
                'keyword_group' => $keywordGroup,
                'message'       => 'Keyword group created successfully',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Failed to create keyword group',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->deleteGroup($id);

        return response()->json([
            'status'  => 'success',
            'message' => 'Keyword group deleted and relations detached',
        ]);
    }

    public function getProjectKeywordGroups(int $project_id): JsonResponse
    {
        return response()->json($this->service->getProjectGroups($project_id));
    }

    public function setProjectKeywordGroups(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'keyword_id'          => 'required|integer|exists:keywords,id',
                'keyword_groups_id'   => 'present|array',
                'keyword_groups_id.*' => 'integer|exists:keyword_groups,id',
            ]);

            $this->service->setKeywordGroup($data);

            return response()->json([
                'status'  => 'success',
                'message' => 'Keyword group has been set for project',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Failed to set keyword group',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function unsetProjectKeywordGroup(int $keyword_id): JsonResponse
    {
        try {
            $this->service->unsetKeywordGroup($keyword_id);

            return response()->json([
                'status'  => 'success',
                'message' => 'Keyword group has been unset',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Failed to unset keyword group',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
