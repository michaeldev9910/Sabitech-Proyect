<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('charla_id')->constrained('charlas')->cascadeOnDelete();
            $table->string('estado')->default('pendiente');
            $table->timestamp('confirmada_en')->nullable();
            $table->timestamp('cancelada_en')->nullable();
            $table->string('qr_semilla')->nullable();
            $table->timestamp('qr_renovado_en')->nullable();
            $table->unique(['usuario_id', 'charla_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
