<?php

namespace App\Http\Controllers;

use App\Models\Sala;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Sala::orderBy('nombre')->get());
    }

    public function show(Sala $sala): JsonResponse
    {
        return response()->json($sala);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre'    => 'required|string|max:100|unique:salas,nombre',
            'ubicacion' => 'nullable|string|max:255',
            'capacidad' => 'required|integer|min:1|max:65535',
        ]);

        $sala = Sala::create($datos);

        return response()->json($sala, 201);
    }

    public function update(Request $request, Sala $sala): JsonResponse
    {
        $datos = $request->validate([
            
            'nombre'    => ['required', 'string', 'max:100', Rule::unique('salas', 'nombre')->ignore($sala->id)],
            'ubicacion' => 'nullable|string|max:255',
            'capacidad' => [
                'bail', 'required', 'integer', 'min:1', 'max:65535',
                // Regla propia: no puede quedar por debajo del aforo de sus charlas
                function (string $atributo, mixed $valor, Closure $fallo) use ($sala) {
                    $aforoMaximo = $sala->charlas()->where('estado', '!=', 'cancelada')->max('aforo');

                    if ($aforoMaximo && $valor < $aforoMaximo) {
                        $fallo("La capacidad es menor que el aforo de alguna charla de esta sala: debe ser al menos {$aforoMaximo}.");
                    }
                },
            ],
        ]);

        $sala->update($datos);

        return response()->json($sala);
    }

    public function destroy(Sala $sala): JsonResponse
    {
        if ($sala->charlas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar: la sala tiene charlas asignadas.',
            ], 409);
        }

        $sala->delete();

        return response()->json(['mensaje' => 'Sala eliminada']);
    }
}