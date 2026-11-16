<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 16)->unique(); 
            $table->foreignId('usuario_id')->constrained('usuarios')->restrictOnDelete();
            $table->foreignId('charla_id')->constrained('charlas')->restrictOnDelete();
            $table->enum('estado', ['confirmada', 'cancelada'])->default('confirmada');
            $table->timestamp('confirmada_en')->useCurrent();
            $table->timestamp('cancelada_en')->nullable(); 
            $table->char('qr_semilla', 32)->nullable();     
            $table->timestamp('qr_renovado_en')->nullable();
            $table->timestamps();

            $table->unique(['usuario_id', 'charla_id']); 
            $table->index(['charla_id', 'estado']);  
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};