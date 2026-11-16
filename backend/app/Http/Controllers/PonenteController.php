<?php

namespace App\Http\Controllers;

use App\Models\Ponente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PonenteController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Ponente::orderBy('nombre')->get());
    }

    public function show(Ponente $ponente): JsonResponse
    {
        $ponente->load(['charlas' => fn ($q) => $q->where('estado', 'publicada')->orderBy('inicio')]);

        return response()->json($ponente);
    }

    public function store(Request $request): JsonResponse
    {
        $ponente = Ponente::create($request->validate($this->reglas()));

        return response()->json($ponente, 201);
    }

    public function update(Request $request, Ponente $ponente): JsonResponse
    {
        $ponente->update($request->validate($this->reglas()));

        return response()->json($ponente);
    }

    public function destroy(Ponente $ponente): JsonResponse
    {
        if ($ponente->charlas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar: el ponente tiene charlas asignadas.',
            ], 409);
        }

        $ponente->delete();

        return response()->json(['mensaje' => 'Ponente eliminado']);
    }

    private function reglas(): array
    {
        return [
            'nombre'       => 'required|string|max:100',
            'apellidos'    => 'nullable|string|max:150',
            'organizacion' => 'nullable|string|max:150',
            'biografia'    => 'nullable|string',
            'foto_url'     => 'nullable|url|max:255',
        ];
    }
}