<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CharlaController;
use App\Http\Controllers\PonenteController;
use App\Http\Controllers\SalaController;
use App\Http\Middleware\EnsureRol;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::get('/charlas', [CharlaController::class, 'index']);
Route::get('/charlas/{charla}', [CharlaController::class, 'show']);

Route::apiResource('ponentes', PonenteController::class)->only(['index', 'show']);
Route::apiResource('salas', SalaController::class)->only(['index', 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::middleware(EnsureRol::class . ':organizacion')->group(function () {
        Route::post('/charlas', [CharlaController::class, 'store']);
        Route::put('/charlas/{charla}', [CharlaController::class, 'update']);
        Route::delete('/charlas/{charla}', [CharlaController::class, 'destroy']);

        Route::apiResource('ponentes', PonenteController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('salas', SalaController::class)->only(['store', 'update', 'destroy']);
    });
});