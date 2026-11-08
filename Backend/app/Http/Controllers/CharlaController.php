<?php

namespace App\Http\Controllers;

use App\Models\Charla;
use App\Models\Sala;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CharlaController extends Controller
{
    /**
     * GET /api/charlas  (publico)
     * Listado de charlas publicadas con ponente, sala y plazas libres.
     */
    public function index(): JsonResponse
    {
        $charlas = Charla::with(['ponente', 'sala'])
            ->withCount('reservasConfirmadas')
            ->where('estado', 'publicada')
            ->orderBy('inicio')
            ->get();
 
        return response()->json($charlas);
    }
 
    /**
     * GET /api/charlas/{charla}  (publico)
     * Detalle de una charla publicada. Laravel devuelve 404 solo si el id no existe.
     */
    public function show(Charla $charla): JsonResponse
    {
        // Un borrador o una charla cancelada no se muestra al publico.
        abort_if($charla->estado !== 'publicada', 404);
 
        $charla->load(['ponente', 'sala'])->loadCount('reservasConfirmadas');
 
        return response()->json($charla);
    }
 
    /**
     * POST /api/charlas  (solo organizacion)
     */
    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());
 
        if ($error = $this->aforoSuperaSala($datos)) {
            return $error;
        }
 
        $charla = Charla::create($datos);
 
        return response()->json($charla->load(['ponente', 'sala']), 201);
    }
 
    /**
     * PUT /api/charlas/{charla}  (solo organizacion)
     */
    public function update(Request $request, Charla $charla): JsonResponse
    {
        $datos = $request->validate($this->reglas());
 
        if ($error = $this->aforoSuperaSala($datos)) {
            return $error;
        }
 
        $charla->update($datos);
 
        return response()->json($charla->load(['ponente', 'sala']));
    }
 
    /**
     * DELETE /api/charlas/{charla}  (solo organizacion)
     * No se borra: se cancela la charla y se liberan sus reservas.
     */
    public function destroy(Charla $charla): JsonResponse
    {
        DB::transaction(function () use ($charla) {
            $charla->update(['estado' => 'cancelada']);
 
            $charla->reservas()
                ->where('estado', 'confirmada')
                ->update([
                    'estado' => 'cancelada',
                    'cancelada_en' => now(),
                    'qr_semilla' => null, // el QR deja de valer
                ]);
        });
 
        return response()->json(['mensaje' => 'Charla cancelada']);
    }
 
    // Reglas de validacion, alineadas con la tabla "charlas".
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
 
    // El aforo no puede superar la capacidad de la sala (no se puede expresar como CHECK en BD).
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
