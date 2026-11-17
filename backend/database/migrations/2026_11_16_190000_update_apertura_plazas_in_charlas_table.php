<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Las reservas se abren siempre 7 días antes del inicio (App\Models\Charla::DIAS_APERTURA_RESERVAS).
 * Desde ahora el modelo lo calcula al guardar; aquí se corrigen las charlas que ya existían.
 * (El 7 va escrito aquí y no se lee del modelo: una migración no debe cambiar si cambia el código.)
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('charlas')->select('id', 'inicio')->orderBy('id')->each(function ($charla) {
            DB::table('charlas')
                ->where('id', $charla->id)
                ->update(['apertura_plazas' => Carbon::parse($charla->inicio)->subDays(7)]);
        });
    }

    public function down(): void
    {
        // Sin vuelta atrás: las fechas de apertura anteriores no se guardaban en ningún otro sitio
    }
};
