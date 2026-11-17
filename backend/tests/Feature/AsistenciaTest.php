<?php

namespace Tests\Feature;

use App\Models\Asistencia;
use App\Models\Charla;
use App\Models\Reserva;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreaDatos;
use Tests\TestCase;

class AsistenciaTest extends TestCase
{
    use CreaDatos, RefreshDatabase;

    public function test_el_personal_de_acceso_registra_la_asistencia_con_el_codigo(): void
    {
        $reserva = $this->reserva($this->usuario(), $this->charlaQueEmpiezaPronto());
        $acceso = $this->usuario('acceso');
        Sanctum::actingAs($acceso);

        // Admite el código en minúsculas y con espacios, como al teclearlo a mano
        $this->postJson('/api/asistencias', ['codigo' => ' ' . strtolower($reserva->codigo) . ' '])
            ->assertCreated()
            ->assertJsonPath('reserva_id', $reserva->id)
            ->assertJsonPath('registrada_por', $acceso->id)
            ->assertJsonPath('reserva.codigo', $reserva->codigo)
            ->assertJsonPath('registrada_por_usuario.id', $acceso->id)
            ->assertJsonMissingPath('reserva.qr_semilla');

        $this->assertDatabaseHas('asistencias', ['reserva_id' => $reserva->id, 'registrada_por' => $acceso->id]);
    }

    public function test_la_organizacion_consulta_las_asistencias_de_una_charla(): void
    {
        $charla = $this->charlaQueEmpiezaPronto();
        $this->asistenciaDe($this->reserva($this->usuario(), $charla));
        $this->asistenciaDe($this->reserva($this->usuario(), $this->charlaQueEmpiezaPronto()));
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->getJson('/api/asistencias')->assertOk()->assertJsonCount(2);
        $this->getJson("/api/asistencias?charla_id={$charla->id}")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.reserva.charla_id', $charla->id);
    }

    public function test_el_asistente_no_registra_ni_consulta_asistencias(): void
    {
        $reserva = $this->reserva($this->usuario(), $this->charlaQueEmpiezaPronto());
        Sanctum::actingAs($this->usuario('asistente'));

        $this->postJson('/api/asistencias', ['codigo' => $reserva->codigo])->assertForbidden();
        $this->getJson('/api/asistencias')->assertForbidden();
    }

    public function test_el_personal_de_acceso_no_ve_el_listado(): void
    {
        Sanctum::actingAs($this->usuario('acceso'));

        $this->getJson('/api/asistencias')->assertForbidden();
    }

    public function test_un_codigo_que_no_existe_da_404(): void
    {
        Sanctum::actingAs($this->usuario('acceso'));

        $this->postJson('/api/asistencias', ['codigo' => 'NOEXISTE00'])
            ->assertNotFound()
            ->assertJsonPath('message', 'No se ha encontrado la reserva.');
    }

    public function test_no_se_registra_una_reserva_cancelada(): void
    {
        $reserva = $this->reserva($this->usuario(), $this->charlaQueEmpiezaPronto(), 'cancelada');
        Sanctum::actingAs($this->usuario('acceso'));

        $this->postJson('/api/asistencias', ['codigo' => $reserva->codigo])
            ->assertConflict()
            ->assertJsonPath('message', 'La reserva está cancelada.');
    }

    public function test_no_se_registra_dos_veces(): void
    {
        $reserva = $this->reserva($this->usuario(), $this->charlaQueEmpiezaPronto());
        Sanctum::actingAs($this->usuario('acceso'));

        $this->postJson('/api/asistencias', ['codigo' => $reserva->codigo])->assertCreated();
        $this->postJson('/api/asistencias', ['codigo' => $reserva->codigo])
            ->assertConflict()
            ->assertJsonPath('message', 'La asistencia ya está registrada.');
    }

    public function test_no_se_registra_antes_de_30_minutos_del_inicio(): void
    {
        $charla = $this->charla(['inicio' => now()->addMinutes(40), 'fin' => now()->addHours(2)]);
        $reserva = $this->reserva($this->usuario(), $charla);
        Sanctum::actingAs($this->usuario('acceso'));

        $this->postJson('/api/asistencias', ['codigo' => $reserva->codigo])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Todavía no se puede registrar la asistencia: se abre 30 min antes del inicio.');
    }

    public function test_no_se_registra_cuando_la_charla_ha_terminado(): void
    {
        $charla = $this->charla(['inicio' => now()->subHours(2), 'fin' => now()->subHour()]);
        $reserva = $this->reserva($this->usuario(), $charla);
        Sanctum::actingAs($this->usuario('acceso'));

        $this->postJson('/api/asistencias', ['codigo' => $reserva->codigo])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'La charla ya ha terminado.');
    }

    private function charlaQueEmpiezaPronto(): Charla
    {
        return $this->charla(['inicio' => now()->addMinutes(10), 'fin' => now()->addHour()]);
    }

    private function asistenciaDe(Reserva $reserva): Asistencia
    {
        return Asistencia::create([
            'reserva_id'     => $reserva->id,
            'registrada_por' => $this->usuario('acceso')->id,
            'qr_ventana'     => 1,
            'registrada_en'  => now(),
        ]);
    }
}
