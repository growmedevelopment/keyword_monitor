<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KeywordController;
use App\Http\Controllers\KeywordGroupController;
use App\Http\Controllers\LinkController;
use App\Http\Controllers\SerpLocationController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// Force {project} to be numeric
Route::pattern('project', '[0-9]+');

Route::middleware('guest')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {

    // USER
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/user', fn(Request $request) => response()->json($request->user()));
    Route::get('/user/api-data', [AuthController::class, 'getAPIUserData']);
    Route::get('/logout', [AuthController::class, 'logout']);

    // SERP
    Route::post('/serp/locations', [SerpLocationController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | PROJECTS (NO CONFLICTS)
    |--------------------------------------------------------------------------
    */

    // List + create
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/archived', [ProjectController::class, 'archived']);
    Route::post('/projects', [ProjectController::class, 'store']);

    // MUST COME AFTER "/projects" to avoid conflicts
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::get('/projects/{project}/detailed', [ProjectController::class, 'showDetailed']);
    Route::get('/projects/{project}/name', [ProjectController::class, 'getProjectName']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    Route::patch('/projects/{project}/restore', [ProjectController::class, 'restore']);

    /*
    |--------------------------------------------------------------------------
    | KEYWORDS (inside project)
    |--------------------------------------------------------------------------
    */
    Route::post('/projects/{project}/keywords/create', [KeywordController::class, 'addKeywordToProject']);

    /*
    |--------------------------------------------------------------------------
    | LINKS (inside project)
    |--------------------------------------------------------------------------
    */

    Route::prefix('/projects/{project}/links')->group(function () {
        Route::get('/{type}', [LinkController::class, 'index']);
        Route::post('/', [LinkController::class, 'store']);

    });

    Route::prefix('/projects/links')->group(function () {
        Route::delete('/{link}', [LinkController::class, 'destroy']);
    });


    /*
    |--------------------------------------------------------------------------
    | KEYWORDS (global)
    |--------------------------------------------------------------------------
    */
    Route::get('/keywords/{keyword}', [KeywordController::class, 'show']);
    Route::post('/keywords/{keyword}/filteredResults', [KeywordController::class, 'filteredResults']);
    Route::delete('/keywords/{keyword}', [KeywordController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | KEYWORD GROUPS
    |--------------------------------------------------------------------------
    */
    Route::get('/keyword-groups', [KeywordGroupController::class, 'index']);
    Route::post('/keyword-groups', [KeywordGroupController::class, 'store']);
    Route::get('/keyword-groups/project/{project}', [KeywordGroupController::class, 'getProjectKeywordGroups']);
    Route::post('/keyword-groups/set-for-keyword', [KeywordGroupController::class, 'setProjectKeywordGroups']);
    Route::post('/keyword-groups/unset-for-keyword/{keyword}', [KeywordGroupController::class, 'unsetProjectKeywordGroup']);
    Route::delete('/keyword-groups/{group}', [KeywordGroupController::class, 'destroy']);
});
