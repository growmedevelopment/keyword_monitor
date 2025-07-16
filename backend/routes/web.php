<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;

//Route::get('/', function () {
//    return view('welcome');
//});

Route::get('/user', function () {
    return response()->json(['message' => 'API workisddng']);
});
