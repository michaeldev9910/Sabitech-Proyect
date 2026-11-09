<?php

namespace App\Http\Controllers;

use App\Models\Charla;
use App\Models\Sala;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CharlaController extends Controller
{
    public function index(): JsonResponse
    {
        $charlas = Charla::with(['ponente', 'sala'])
            ->withCount('reservasConfirmadas')
            ->where('estado', 'publicada')
            ->orderBy('inicio')
            ->get();
 
        return response()->json($charlas, 200);
    }
 
    public function show(Charla $charla): JsonResponse
    {
        abort_if($charla->estado !== 'publicada', 404);
 
        $charla->load(['ponente', 'sala'])->loadCount('reservasConfirmadas');
 
        return response()->json($charla);
    }
 
    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());
 
        if ($error = $this->aforoSuperaSala($datos)) {
            return $error;
        }
 
        $charla = Charla::create($datos);
 
        return response()->json($charla->load(['ponente', 'sala']), 201);
    }
 
    public function update(Request $request, Charla $charla): JsonResponse
    {
        $datos = $request->validate($this->reglas());
 
        if ($error = $this->aforoSuperaSala($datos)) {
            return $error;
        }
 
        $charla->update($datos);
 
        return response()->json($charla->load(['ponente', 'sala']));
    }
 
    public function destroy(Charla $charla): JsonResponse
    {
        DB::transaction(function () use ($charla) {
            $charla->update(['estado' => 'cancelada']);
 
            $charla->reservas()
                ->where('estado', 'confirmada')
                ->update([
                    'estado' => 'cancelada',
                    'cancelada_en' => now(),
                    'qr_semilla' => null, 
                ]);
        });
 
        return response()->json(['mensaje' => 'Charla cancelada']);
    }
 
    private function reglas(): array
    {
        return [
            'ponente_id'      => 'required|integer|exists:ponentes,id',
            'sala_id'         => 'required|integer|exists:salas,id',
            'titulo'          => 'required|string|max:150',
            'descripcion'     => 'nullable|string',
            'inicio'          => 'required|date',
            'fin'             => 'required|date|after:inicio',
            'apertura_plazas' => 'required|date|before:inicio',
            'aforo'           => 'required|integer|min:1',
            'estado'          => 'sometimes|in:borrador,publicada,cancelada',
        ];
    }
 
    private function aforoSuperaSala(array $datos): ?JsonResponse
    {
        $sala = Sala::findOrFail($datos['sala_id']);
 
        if ($datos['aforo'] > $sala->capacidad) {
            return response()->json([
                'message' => 'El aforo supera la capacidad de la sala.',
                'errors'  => ['aforo' => ["La sala admite como maximo {$sala->capacidad} personas."]],
            ], 422);
        }
 
        return null;
    }
}
