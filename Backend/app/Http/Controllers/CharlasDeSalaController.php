<?php

namespace App\Http\Controllers;

use App\Models\Sala;
use Illuminate\Http\JsonResponse;

/**
 * Controlador de una sola acción (__invoke).
 * GET /api/salas/{sala}/charlas → charlas publicadas que se celebran en esa sala.
 */
class CharlasDeSalaController extends Controller
{
    public function __invoke(Sala $sala): JsonResponse
    {
        $charlas = $sala->charlas()
            ->with('ponente')
            ->withCount('reservasConfirmadas')
            ->where('estado', 'publicada')
            ->orderBy('inicio')
            ->get();

        return response()->json($charlas);
    }
}
