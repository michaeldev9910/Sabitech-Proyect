<?php

namespace App\Http\Controllers;

use App\Models\Charla;
use App\Models\Sala;
use Closure;
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
 
    public function show(string $id): JsonResponse
    {
        // Solo charlas publicadas: si no existe o no está publicada, findOrFail()
        // lanza una excepción y Laravel responde solo, sin escribir el código a mano.
        $charla = Charla::with(['ponente', 'sala'])
            ->withCount('reservasConfirmadas')
            ->where('estado', 'publicada')
            ->findOrFail($id);

        return response()->json($charla);
    }
 
    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas($request));

        $charla = Charla::create($datos);
 
        return response()->json($charla->load(['ponente', 'sala']), 201);
    }
 
    public function update(Request $request, Charla $charla): JsonResponse
    {
        $datos = $request->validate($this->reglas($request));

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
 
    private function reglas(Request $request): array
    {
        return [
            'ponente_id'      => 'required|integer|exists:ponentes,id',
            'sala_id'         => 'required|integer|exists:salas,id',
            'titulo'          => 'required|string|max:150',
            'descripcion'     => 'nullable|string',
            'inicio'          => 'required|date',
            'fin'             => 'required|date|after:inicio',
            'apertura_plazas' => 'required|date|before:inicio',
            'aforo'           => [
                'bail', 'required', 'integer', 'min:1',
                // Regla propia: el aforo no puede superar la capacidad de la sala elegida.
                // Si falla, validate() devuelve el error igual que con las demás reglas.
                function (string $atributo, mixed $valor, Closure $fallo) use ($request) {
                    $sala = Sala::find($request->input('sala_id'));

                    if ($sala && $valor > $sala->capacidad) {
                        $fallo("El aforo supera la capacidad de la sala: admite como maximo {$sala->capacidad} personas.");
                    }
                },
            ],
            'estado'          => 'sometimes|in:borrador,publicada,cancelada',
        ];
    }
}
