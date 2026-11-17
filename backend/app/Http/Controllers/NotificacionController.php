<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Correos enviados (o pendientes de enviar) por cada reserva, para que la organización
 * vea cuáles han fallado. Son de solo lectura: las notificaciones las crea el sistema
 * al reservar, no se escriben desde la API.
 */
class NotificacionController extends Controller
{
    /**
     * GET /api/notificaciones → de la más reciente a la más antigua. Con ?estado=fallida filtra por estado.
     */
    public function index(Request $request): JsonResponse
    {
        $filtro = $request->validate([
            'estado' => 'nullable|in:pendiente,enviada,fallida',
        ]);

        $notificaciones = Notificacion::with('reserva:id,codigo,usuario_id,charla_id,estado')
            ->when($filtro['estado'] ?? null, fn ($consulta, $estado) => $consulta->where('estado', $estado))
            ->latest()
            ->get();

        return response()->json($notificaciones);
    }

    /**
     * GET /api/notificaciones/{notificacion} → con la reserva, su usuario y su charla.
     */
    public function show(Notificacion $notificacion): JsonResponse
    {
        return response()->json($notificacion->load([
            'reserva.usuario',
            'reserva.charla' => fn ($consulta) => $consulta->withCount('reservasConfirmadas'),
        ]));
    }
}
