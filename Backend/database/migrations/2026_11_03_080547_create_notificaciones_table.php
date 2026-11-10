<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reserva_id')->constrained('reservas')->restrictOnDelete();
            $table->string('destinatario');           
            $table->string('asunto', 200);
            $table->enum('estado', ['pendiente', 'enviada', 'fallida'])->default('pendiente');
            $table->unsignedTinyInteger('intentos')->default(0);
            $table->string('ultimo_error', 500)->nullable();
            $table->timestamp('enviada_en')->nullable();
            $table->timestamps();

            $table->index(['estado', 'intentos']);        
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};