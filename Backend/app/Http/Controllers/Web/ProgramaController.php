<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Charla;
use Illuminate\View\View;

/**
 * Página web (Blade) con el programa de charlas publicadas.
 */
class ProgramaController extends Controller
{
    public function index(): View
    {
        $charlas = Charla::with(['ponente', 'sala'])
            ->withCount('reservasConfirmadas')
            ->where('estado', 'publicada')
            ->orderBy('inicio')
            ->get();

        // Busca resources/views/charlas/index.blade.php y le pasa $charlas
        return view('charlas.index', ['charlas' => $charlas]);
    }
}
