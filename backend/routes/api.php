<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KeywordController;
use App\Http\Controllers\KeywordGroupController;
use App\Http\Controllers\SerpLocationController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;
use Illuminate\Http\Request;

Route::middleware('guest')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/user', static function (Request $request) {
        return response()->json($request->user());
    });

    Route::get('/user/api-data', [AuthController::class, 'getAPIUserData']);

    Route::get('/logout', [AuthController::class, 'logout']);

    Route::post('/serp/locations', [SerpLocationController::class, 'index']);

    Route::get('/projects/archived', [ProjectController::class, 'archived'])->name('projects.archived');

    Route::patch('/projects/{id}/restore', [ProjectController::class, 'restore'])->name('projects.restore');

    Route::apiResource('projects', ProjectController::class);

    Route::post('/projects/{project}/keywords/create', [KeywordController::class, 'addKeywordToProject']);

    Route::post('/projects/{id}/keywords/seo-metrics', [KeywordController::class, 'getSeoMetrics']);

    Route::get('/keywords/{keyword}', [KeywordController::class, 'show']);

    Route::delete('/keywords/{keyword}', [KeywordController::class, 'destroy']);

    Route::get('/keyword-groups', [KeywordGroupController::class, 'index']);

    Route::post('/keyword-groups', [KeywordGroupController::class, 'store']);

    Route::get('/keyword-groups/project/{project_id}', [KeywordGroupController::class, 'getProjectKeywordGroups']);;

    Route::post('/keyword-groups/set-for-keyword', [KeywordGroupController::class, 'setProjectKeywordGroups']);;

    Route::post('/keyword-groups/unset-for-keyword/{keyword_id}', [KeywordGroupController::class, 'unsetProjectKeywordGroup']);

    Route::delete('/keyword-groups/{id}', [KeywordGroupController::class, 'destroy']);
});


