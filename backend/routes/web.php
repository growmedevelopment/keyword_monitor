<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// routes/web.php
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
