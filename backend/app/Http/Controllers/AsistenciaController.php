<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Reserva;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Asistencia a las charlas. El personal de sala (rol acceso) la registra con el
 * código de la reserva; la organización consulta quién ha asistido.
 *
 * Pendiente para febrero: validar el QR temporal. Entonces qr_ventana vendrá del QR
 * escaneado; por ahora se guarda la ventana de 30 s en la que se registra.
 */
class AsistenciaController extends Controller
{
    // La entrada se valida desde 30 min antes del inicio (cuando sale el QR) hasta que acaba la charla
    private const MINUTOS_APERTURA = 30;

    // El QR cambia cada 30 s: qr_ventana es el número de ese tramo de 30 s
    private const SEGUNDOS_VENTANA_QR = 30;

    /**
     * GET /api/asistencias → de la más reciente a la más antigua. Con ?charla_id=3 solo las de esa charla.
     */
    public function index(Request $request): JsonResponse
    {
        $filtro = $request->validate([
            'charla_id' => 'nullable|integer|exists:charlas,id',
        ]);

        $asistencias = Asistencia::with($this->relaciones())
            ->when(
                $filtro['charla_id'] ?? null,
                fn ($consulta, $charlaId) => $consulta->whereRelation('reserva', 'charla_id', $charlaId),
            )
            ->latest('registrada_en')
            ->get();

        return response()->json($asistencias);
    }

    /**
     * POST /api/asistencias → registra la entrada de una reserva confirmada a partir de su código.
     */
    public function store(Request $request): JsonResponse
    {
        $request->merge(['codigo' => Str::upper(trim((string) $request->input('codigo')))]);

        $datos = $request->validate([
            'codigo' => 'required|string|max:16',
        ], [
            'codigo.required' => 'Indica el código de la reserva.',
        ]);

        $asistencia = DB::transaction(function () use ($datos, $request) {
            // Bloquea la reserva: si dos personas validan la misma entrada a la vez, solo cuenta una
            $reserva = Reserva::with('charla')->where('codigo', $datos['codigo'])->lockForUpdate()->first();

            abort_unless($reserva, 404, 'No se ha encontrado la reserva.');
            abort_if($reserva->estado !== 'confirmada', 409, 'La reserva está cancelada.');
            abort_if($reserva->asistencia()->exists(), 409, 'La asistencia ya está registrada.');

            $charla = $reserva->charla;

            abort_if(
                now()->lt($charla->inicio->copy()->subMinutes(self::MINUTOS_APERTURA)),
                422,
                'Todavía no se puede registrar la asistencia: se abre ' . self::MINUTOS_APERTURA . ' min antes del inicio.',
            );
            abort_if(now()->gt($charla->fin), 422, 'La charla ya ha terminado.');

            return Asistencia::create([
                'reserva_id'     => $reserva->id,
                'registrada_por' => $request->user()->id,
                'qr_ventana'     => intdiv(now()->timestamp, self::SEGUNDOS_VENTANA_QR),
                'registrada_en'  => now(),
            ]);
        });

        return response()->json($asistencia->load($this->relaciones()), 201);
    }

    /**
     * Cada asistencia con su reserva (persona y charla) y quién la registró.
     */
    private function relaciones(): array
    {
        return [
            'reserva.usuario',
            'reserva.charla' => fn ($consulta) => $consulta->withCount('reservasConfirmadas'),
            'registradaPorUsuario',
        ];
    }
}
