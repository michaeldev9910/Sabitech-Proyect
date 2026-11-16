<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Una charla puede tener varios ponentes: la relación deja de ser la columna
 * charlas.ponente_id y pasa a la tabla intermedia charla_ponente.
 * Cada charla conserva el ponente que ya tenía.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('charla_ponente', function (Blueprint $table) {
            $table->foreignId('charla_id')->constrained('charlas')->cascadeOnDelete();
            $table->foreignId('ponente_id')->constrained('ponentes')->restrictOnDelete();
            $table->timestamps();

            // Un ponente no puede estar dos veces en la misma charla
            $table->primary(['charla_id', 'ponente_id']);
        });

        DB::table('charla_ponente')->insertUsing(
            ['charla_id', 'ponente_id', 'created_at', 'updated_at'],
            DB::table('charlas')->select('id', 'ponente_id', 'created_at', 'updated_at'),
        );

        Schema::table('charlas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('ponente_id');
        });
    }

    public function down(): void
    {
        Schema::table('charlas', function (Blueprint $table) {
            $table->foreignId('ponente_id')->nullable()->after('id')->constrained('ponentes')->restrictOnDelete();
        });

        // Vuelve a un solo ponente por charla: el de id más bajo
        DB::table('charla_ponente')
            ->selectRaw('charla_id, MIN(ponente_id) AS ponente_id')
            ->groupBy('charla_id')
            ->get()
            ->each(fn ($fila) => DB::table('charlas')
                ->where('id', $fila->charla_id)
                ->update(['ponente_id' => $fila->ponente_id]));

        Schema::dropIfExists('charla_ponente');
    }
};
