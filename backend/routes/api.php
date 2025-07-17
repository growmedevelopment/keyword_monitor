<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;
use Illuminate\Http\Request;

Route::middleware('guest')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        dd($request->user());
        return response()->json($request->user());
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('projects', ProjectController::class);
});



