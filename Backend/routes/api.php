<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CharlaController;
use App\Http\Middleware\EnsureRol;
use Illuminate\Support\Facades\Route;

// --- Publico (no requiere login) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::get('/charlas', [CharlaController::class, 'index']);
Route::get('/charlas/{charla}', [CharlaController::class, 'show']);

// --- Requiere login (token de Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // --- Solo perfil "organizacion" ---
    Route::middleware(EnsureRol::class . ':organizacion')->group(function () {
        Route::post('/charlas', [CharlaController::class, 'store']);
        Route::put('/charlas/{charla}', [CharlaController::class, 'update']);
        Route::delete('/charlas/{charla}', [CharlaController::class, 'destroy']);
    });
});