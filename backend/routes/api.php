<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CharlaController;
use App\Http\Controllers\CharlasDeSalaController;
use App\Http\Controllers\ContactoController;
use App\Http\Controllers\PonenteController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\SalaController;
use App\Http\Middleware\EnsureRol;
use Illuminate\Support\Facades\Route;

// ->name('...')      da un nombre a la ruta para generar su URL con route('...').
// ->whereNumber('x') exige que el parámetro {x} sea un número: con /api/charlas/abc
//                    la ruta no coincide y no se llega al controlador ni a la base de datos.
// Las rutas de apiResource ya tienen nombre automático (salas.index, salas.show...).

Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1')
    ->name('auth.login');

Route::get('/charlas', [CharlaController::class, 'index'])->name('charlas.index');
Route::get('/charlas/{charla}', [CharlaController::class, 'show'])
    ->whereNumber('charla')
    ->name('charlas.show');

Route::apiResource('ponentes', PonenteController::class)
    ->only(['index', 'show'])
    ->where(['ponente' => '[0-9]+']);
Route::apiResource('salas', SalaController::class)
    ->only(['index', 'show'])
    ->where(['sala' => '[0-9]+']);

// Controlador de una sola acción: se pasa la clase sin indicar el método
Route::get('/salas/{sala}/charlas', CharlasDeSalaController::class)
    ->whereNumber('sala')
    ->name('salas.charlas');

// Formulario de contacto: público, limitado a 5 envíos por minuto por IP.
// Solo envía un correo; no guarda nada en la base de datos.
Route::post('/contacto', ContactoController::class)
    ->middleware('throttle:5,1')
    ->name('contacto.enviar');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/me', [AuthController::class, 'me'])->name('auth.me');

    // Reservas de la persona que ha iniciado sesión. El rol "acceso" no reserva: solo valida la entrada.
    Route::middleware(EnsureRol::class . ':asistente,organizacion')->group(function () {
        Route::get('/mis-reservas', [ReservaController::class, 'index'])->name('reservas.mias');
        Route::post('/reservas', [ReservaController::class, 'store'])->name('reservas.store');
        Route::delete('/reservas/{reserva}', [ReservaController::class, 'destroy'])
            ->whereNumber('reserva')
            ->name('reservas.destroy');
    });

    Route::middleware(EnsureRol::class . ':organizacion')->group(function () {
        Route::post('/charlas', [CharlaController::class, 'store'])->name('charlas.store');
        Route::put('/charlas/{charla}', [CharlaController::class, 'update'])
            ->whereNumber('charla')
            ->name('charlas.update');
        Route::delete('/charlas/{charla}', [CharlaController::class, 'destroy'])
            ->whereNumber('charla')
            ->name('charlas.destroy');

        Route::apiResource('ponentes', PonenteController::class)
            ->only(['store', 'update', 'destroy'])
            ->where(['ponente' => '[0-9]+']);
        Route::apiResource('salas', SalaController::class)
            ->only(['store', 'update', 'destroy'])
            ->where(['sala' => '[0-9]+']);
    });
});
