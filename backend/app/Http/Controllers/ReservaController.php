<?php

namespace App\Http\Controllers;

use App\Models\Charla;
use App\Models\Reserva;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Reservas de la persona que ha iniciado sesión (roles asistente y organización).
 * El frontend enseña estas mismas reglas (src/utils/rules.js y bookings.js),
 * pero quien decide es el servidor.
 */
class ReservaController extends Controller
{
    // Se puede cancelar hasta 24 h antes del inicio de la charla
    private const HORAS_LIMITE_CANCELAR = 24;

    /**
     * GET /api/mis-reservas → todas sus reservas, también las canceladas, con su charla.
     */
    public function index(Request $request): JsonResponse
    {
        $reservas = $request->user()->reservas()
            ->with($this->relaciones())
            ->latest()
            ->get();

        return response()->json($reservas);
    }

    /**
     * POST /api/reservas → plaza en una charla publicada, con el plazo abierto y sitio libre.
     */
    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'charla_id' => 'required|integer|exists:charlas,id',
        ], [
            'charla_id.required' => 'Indica la charla que quieres reservar.',
            'charla_id.integer'  => 'Indica la charla que quieres reservar.',
            'charla_id.exists'   => 'La charla no existe.',
        ]);

        $usuario = $request->user();

        $reserva = DB::transaction(function () use ($datos, $usuario) {
            // Bloquea la charla hasta terminar: dos reservas a la vez no pueden pasarse del aforo
            $charla = Charla::lockForUpdate()->findOrFail($datos['charla_id']);

            abort_if($charla->estado !== 'publicada', 422, 'Esta charla no admite reservas.');
            abort_if(now()->lt($charla->apertura_plazas), 422, 'Las reservas de esta charla todavía no están abiertas.');
            abort_if(now()->gte($charla->inicio), 422, 'La charla ya ha empezado: no admite reservas.');

            // Persona y charla son únicas en reservas: si la canceló antes, se reactiva la misma
            $reserva = Reserva::firstOrNew(['usuario_id' => $usuario->id, 'charla_id' => $charla->id]);

            abort_if($reserva->estado === 'confirmada', 409, 'Ya tienes plaza en esta charla.');
            abort_if($charla->reservasConfirmadas()->count() >= $charla->aforo, 409, 'No quedan plazas libres en esta charla.');

            $reserva->fill([
                'codigo'        => $reserva->codigo ?? $this->codigoNuevo(),
                'estado'        => 'confirmada',
                'confirmada_en' => now(),
                'cancelada_en'  => null,
            ])->save();

            return $reserva;
        });

        return response()->json($reserva->load($this->relaciones()), 201);
    }

    /**
     * DELETE /api/reservas/{reserva} → cancela una reserva propia hasta 24 h antes del inicio.
     */
    public function destroy(Request $request, Reserva $reserva): JsonResponse
    {
        // Las reservas de otras personas se tratan como si no existieran
        abort_unless($reserva->usuario()->is($request->user()), 404, 'No se ha encontrado la reserva.');
        abort_if($reserva->estado !== 'confirmada', 409, 'La reserva ya está cancelada.');
        abort_if($reserva->asistencia()->exists(), 409, 'Ya consta tu asistencia a esta charla.');
        abort_if(
            now()->addHours(self::HORAS_LIMITE_CANCELAR)->gte($reserva->charla->inicio),
            422,
            'Solo se puede cancelar hasta ' . self::HORAS_LIMITE_CANCELAR . ' h antes del inicio.',
        );

        $reserva->update([
            'estado'       => 'cancelada',
            'cancelada_en' => now(),
            'qr_semilla'   => null,
        ]);

        return response()->json(['mensaje' => 'Reserva cancelada']);
    }

    /**
     * Lo que el frontend necesita de cada reserva: la charla (con ponentes, sala
     * y plazas libres) y si ya consta la asistencia.
     */
    private function relaciones(): array
    {
        return [
            'charla' => fn ($consulta) => $consulta->with(['ponentes', 'sala'])->withCount('reservasConfirmadas'),
            'asistencia',
        ];
    }

    // Código que se enseña a la persona al reservar: 10 caracteres que no se repitan
    private function codigoNuevo(): string
    {
        do {
            $codigo = Str::upper(Str::random(10));
        } while (Reserva::where('codigo', $codigo)->exists());

        return $codigo;
    }
}
