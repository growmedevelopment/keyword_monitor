<?php

namespace App\Http\Controllers;

use App\Models\KeywordGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KeywordGroupController extends Controller {

    public function index(): JsonResponse {
        $groups = KeywordGroup::all();
        return response()->json($groups);
    }

    public function store(Request $request): JsonResponse {
        try {
            $data = $request->validate([
                'name'  => 'required|string|unique:keyword_groups,name',
                'color' => ['required', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            ]);

            KeywordGroup::create($data);

            return response()->json([
                'message' => 'Keyword group created',
            ], 201);
        }
        catch ( \Exception $e ) {
            return response()->json([
                'error'   => 'Failed to create keyword group',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse {
        $group = KeywordGroup::findOrFail($id);

        $group->keywords()->update(['keyword_group_id' => NULL]);

        $group->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Keyword group deleted and relations detached',
        ]);
    }

}
