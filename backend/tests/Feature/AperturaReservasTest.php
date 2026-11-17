<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreaDatos;
use Tests\TestCase;

class AperturaReservasTest extends TestCase
{
    use CreaDatos, RefreshDatabase;

    public function test_las_reservas_se_abren_7_dias_antes_del_inicio(): void
    {
        $inicio = now()->addMonth()->startOfHour();
        $charla = $this->charla(['inicio' => $inicio, 'fin' => $inicio->copy()->addHour()]);

        $this->assertTrue($charla->apertura_plazas->equalTo($inicio->copy()->subDays(7)));
    }

    public function test_al_mover_la_charla_se_mueve_la_apertura(): void
    {
        $charla = $this->charla();
        $nuevoInicio = now()->addMonths(2)->startOfHour();

        $charla->update(['inicio' => $nuevoInicio, 'fin' => $nuevoInicio->copy()->addHour()]);

        $this->assertTrue($charla->fresh()->apertura_plazas->equalTo($nuevoInicio->copy()->subDays(7)));
    }

    public function test_la_api_no_deja_elegir_la_apertura(): void
    {
        Sanctum::actingAs($this->usuario('organizacion'));
        $inicio = now()->addMonth()->startOfHour();

        $this->postJson('/api/charlas', [
            'ponentes'        => [$this->ponente()->id],
            'sala_id'         => $this->sala()->id,
            'titulo'          => 'Charla con una apertura inventada',
            'inicio'          => $inicio->toDateTimeString(),
            'fin'             => $inicio->copy()->addHour()->toDateTimeString(),
            'apertura_plazas' => now()->toDateTimeString(),
            'aforo'           => 20,
            'estado'          => 'publicada',
        ])
            ->assertCreated()
            ->assertJsonPath('apertura_plazas', $inicio->copy()->subDays(7)->toJSON());
    }
}
