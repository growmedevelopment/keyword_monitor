<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


//// routes/web.php
//Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
//
//
//
//Route::middleware('auth:sanctum')->group(function () {
//    Route::apiResource('projects', ProjectController::class);
//});
