<?php

use App\Http\Controllers\Web\ProgramaController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Páginas hechas con Blade, servidas por el propio backend (http://localhost:8080)
Route::get('/programa', [ProgramaController::class, 'index'])->name('programa.index');
