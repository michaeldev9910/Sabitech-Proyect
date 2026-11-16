<?php

namespace Tests\Feature;

use App\Models\Ponente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreaDatos;
use Tests\TestCase;

class CharlaPonentesTest extends TestCase
{
    use CreaDatos, RefreshDatabase;

    public function test_cada_charla_trae_todos_sus_ponentes(): void
    {
        $this->charla()->ponentes()->attach([$this->ponente('Laura')->id, $this->ponente('Hugo')->id]);

        $respuesta = $this->getJson('/api/charlas')
            ->assertOk()
            ->assertJsonCount(2, '0.ponentes')
            ->assertJsonMissingPath('0.ponente_id');

        $this->assertEqualsCanonicalizing(['Laura', 'Hugo'], $respuesta->json('0.ponentes.*.nombre'));
    }

    public function test_la_organizacion_crea_una_charla_con_varios_ponentes(): void
    {
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->postJson('/api/charlas', [
            ...$this->datosDeCharla(),
            'ponentes' => [$this->ponente('Laura')->id, $this->ponente('Hugo')->id],
        ])
            ->assertCreated()
            ->assertJsonCount(2, 'ponentes');

        $this->assertDatabaseCount('charla_ponente', 2);
    }

    public function test_al_editar_una_charla_se_sustituyen_sus_ponentes(): void
    {
        Sanctum::actingAs($this->usuario('organizacion'));
        $charla = $this->charla();
        $charla->ponentes()->attach([$this->ponente('Laura')->id, $this->ponente('Daniel')->id]);

        $this->putJson("/api/charlas/{$charla->id}", [
            ...$this->datosDeCharla(),
            'sala_id'  => $charla->sala_id,
            'ponentes' => [$this->ponente('Hugo')->id],
        ])
            ->assertOk()
            ->assertJsonCount(1, 'ponentes')
            ->assertJsonPath('ponentes.0.nombre', 'Hugo');

        $this->assertDatabaseCount('charla_ponente', 1);
    }

    public function test_una_charla_necesita_al_menos_un_ponente(): void
    {
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->postJson('/api/charlas', [...$this->datosDeCharla(), 'ponentes' => []])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['ponentes' => 'Indica al menos un ponente.']);

        $this->assertDatabaseCount('charlas', 0);
    }

    public function test_no_se_puede_borrar_un_ponente_que_tiene_charlas(): void
    {
        Sanctum::actingAs($this->usuario('organizacion'));
        $ponente = $this->ponente();
        $this->charla()->ponentes()->attach($ponente);

        $this->deleteJson("/api/ponentes/{$ponente->id}")->assertConflict();

        $this->assertModelExists($ponente);
    }

    public function test_la_pagina_del_programa_muestra_todos_los_ponentes(): void
    {
        $this->charla()->ponentes()->attach([$this->ponente('Laura')->id, $this->ponente('Hugo')->id]);

        $this->get('/programa')
            ->assertOk()
            ->assertSee('Laura De Prueba')
            ->assertSee('Hugo De Prueba');
    }

    public function test_nombres_ponentes_los_une_como_en_castellano(): void
    {
        $ponentes = [
            new Ponente(['nombre' => 'Laura', 'apellidos' => 'Martinez']),
            new Ponente(['nombre' => 'Hugo', 'apellidos' => null]),
            new Ponente(['nombre' => 'Marta', 'apellidos' => 'Quiles']),
        ];

        $this->assertSame('Laura Martinez, Hugo y Marta Quiles', nombres_ponentes($ponentes));
        $this->assertSame('Ponente por confirmar', nombres_ponentes([]));
    }

    /**
     * Datos válidos de una charla para crearla o editarla (sin los ponentes).
     */
    private function datosDeCharla(): array
    {
        $inicio = now()->addWeek()->startOfHour();

        return [
            'sala_id'         => $this->sala()->id,
            'titulo'          => 'Charla a dos voces',
            'inicio'          => $inicio->toDateTimeString(),
            'fin'             => $inicio->copy()->addHour()->toDateTimeString(),
            'apertura_plazas' => now()->toDateTimeString(),
            'aforo'           => 20,
            'estado'          => 'publicada',
        ];
    }
}
