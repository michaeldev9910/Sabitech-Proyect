<?php

use App\Http\Controllers\CharlaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/charlas', [CharlaController::class, 'index']);
Route::get('/charlas/{charla}', [CharlaController::class, 'show']);
