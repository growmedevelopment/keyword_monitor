<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->get('/test', function () {
    return response()->json(['message' => 'ok']);
});

//Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('projects', ProjectController::class);
//});



