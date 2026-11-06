<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
            $table->string('titulo', 150);
            $table->text('descripcion')->nullable();
            $table->dateTime('inicio');
            $table->dateTime('fin');            
            $table->dateTime('apertura_plazas');
            $table->unsignedSmallInteger('aforo');
            $table->enum('estado', ['borrador', 'publicada', 'cancelada'])->default('borrador');
            $table->timestamps();

            $table->index(['sala_id', 'inicio']);
            $table->index(['estado', 'inicio']);
        });

        DB::statement(
            'ALTER TABLE charlas ADD CONSTRAINT chk_charlas_fechas
             CHECK (fin > inicio AND apertura_plazas < inicio AND aforo > 0)'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('charlas');
    }
};