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
        Schema::create('charlas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ponente_id')->constrained('ponentes')->restrictOnDelete();
            $table->foreignId('sala_id')->constrained('salas')->restrictOnDelete();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->dateTime('inicio');
            $table->dateTime('fin');
            $table->dateTime('apertura_plazas')->nullable();
            $table->unsignedInteger('aforo');
            $table->string('estado')->default('programada');
            $table->index(['sala_id', 'inicio']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('charlas');
    }
};
