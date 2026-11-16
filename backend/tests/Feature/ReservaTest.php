<?php

namespace Tests\Feature;

use App\Models\Asistencia;
use App\Models\Charla;
use App\Models\Reserva;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\CreaDatos;
use Tests\TestCase;

class ReservaTest extends TestCase
{
    use CreaDatos, RefreshDatabase;

    public function test_reserva_una_plaza_y_la_ve_en_sus_reservas(): void
    {
        $charla = $this->charla();
        $charla->ponentes()->attach($this->ponente('Laura'));
        Sanctum::actingAs($this->usuario('asistente'));

        $this->postJson('/api/reservas', ['charla_id' => $charla->id])
            ->assertCreated()
            ->assertJsonStructure(['id', 'codigo'])
            ->assertJsonPath('charla_id', $charla->id)
            ->assertJsonPath('estado', 'confirmada')
            ->assertJsonPath('charla.plazas_libres', 19)
            ->assertJsonMissingPath('qr_semilla');

        $this->getJson('/api/mis-reservas')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.charla.titulo', 'Charla de prueba')
            ->assertJsonPath('0.charla.ponentes.0.nombre', 'Laura')
            ->assertJsonPath('0.asistencia', null);
    }

    public function test_la_organizacion_tambien_reserva(): void
    {
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->postJson('/api/reservas', ['charla_id' => $this->charla()->id])->assertCreated();
    }

    public function test_el_rol_acceso_no_reserva(): void
    {
        Sanctum::actingAs($this->usuario('acceso'));

        $this->postJson('/api/reservas', ['charla_id' => $this->charla()->id])->assertForbidden();
        $this->getJson('/api/mis-reservas')->assertForbidden();
    }

    public function test_sin_sesion_no_se_reserva(): void
    {
        $this->postJson('/api/reservas', ['charla_id' => $this->charla()->id])->assertUnauthorized();
    }

    public function test_no_se_reserva_dos_veces_la_misma_charla(): void
    {
        $charla = $this->charla();
        Sanctum::actingAs($this->usuario());

        $this->postJson('/api/reservas', ['charla_id' => $charla->id])->assertCreated();
        $this->postJson('/api/reservas', ['charla_id' => $charla->id])
            ->assertConflict()
            ->assertJsonPath('message', 'Ya tienes plaza en esta charla.');
    }

    public function test_no_se_reserva_si_no_quedan_plazas(): void
    {
        $charla = $this->charla(['aforo' => 1]);
        $this->reservaDe($this->usuario(), $charla);
        Sanctum::actingAs($this->usuario());

        $this->postJson('/api/reservas', ['charla_id' => $charla->id])
            ->assertConflict()
            ->assertJsonPath('message', 'No quedan plazas libres en esta charla.');
    }

    public function test_no_se_reserva_antes_de_que_abra_el_plazo(): void
    {
        $charla = $this->charla(['apertura_plazas' => now()->addDay()]);
        Sanctum::actingAs($this->usuario());

        $this->postJson('/api/reservas', ['charla_id' => $charla->id])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Las reservas de esta charla todavía no están abiertas.');
    }

    public function test_no_se_reserva_una_charla_que_ya_ha_empezado(): void
    {
        $charla = $this->charla([
            'inicio'          => now()->subMinutes(10),
            'fin'             => now()->addHour(),
            'apertura_plazas' => now()->subDay(),
        ]);
        Sanctum::actingAs($this->usuario());

        $this->postJson('/api/reservas', ['charla_id' => $charla->id])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'La charla ya ha empezado: no admite reservas.');
    }

    public function test_no_se_reserva_una_charla_sin_publicar(): void
    {
        $charla = $this->charla(['estado' => 'borrador']);
        Sanctum::actingAs($this->usuario());

        $this->postJson('/api/reservas', ['charla_id' => $charla->id])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Esta charla no admite reservas.');
    }

    public function test_cancela_su_reserva_y_puede_volver_a_reservar(): void
    {
        $charla = $this->charla();
        Sanctum::actingAs($this->usuario());

        $id = $this->postJson('/api/reservas', ['charla_id' => $charla->id])->json('id');

        $this->deleteJson("/api/reservas/{$id}")
            ->assertOk()
            ->assertJson(['mensaje' => 'Reserva cancelada']);
        $this->assertDatabaseHas('reservas', ['id' => $id, 'estado' => 'cancelada']);

        // Persona y charla son únicas en reservas: se reactiva la misma reserva
        $this->postJson('/api/reservas', ['charla_id' => $charla->id])
            ->assertCreated()
            ->assertJsonPath('id', $id)
            ->assertJsonPath('estado', 'confirmada');
    }

    public function test_no_se_cancela_a_menos_de_24_horas_del_inicio(): void
    {
        $usuario = $this->usuario();
        $reserva = $this->reservaDe($usuario, $this->charla([
            'inicio'          => now()->addHours(5),
            'fin'             => now()->addHours(6),
            'apertura_plazas' => now()->subDay(),
        ]));
        Sanctum::actingAs($usuario);

        $this->deleteJson("/api/reservas/{$reserva->id}")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Solo se puede cancelar hasta 24 h antes del inicio.');
    }

    public function test_no_se_cancelan_reservas_de_otra_persona(): void
    {
        $reserva = $this->reservaDe($this->usuario(), $this->charla());
        Sanctum::actingAs($this->usuario());

        $this->deleteJson("/api/reservas/{$reserva->id}")->assertNotFound();

        $this->assertDatabaseHas('reservas', ['id' => $reserva->id, 'estado' => 'confirmada']);
    }

    public function test_no_se_cancela_una_reserva_ya_cancelada(): void
    {
        $usuario = $this->usuario();
        $reserva = $this->reservaDe($usuario, $this->charla(), 'cancelada');
        Sanctum::actingAs($usuario);

        $this->deleteJson("/api/reservas/{$reserva->id}")
            ->assertConflict()
            ->assertJsonPath('message', 'La reserva ya está cancelada.');
    }

    public function test_no_se_cancela_si_ya_consta_la_asistencia(): void
    {
        $usuario = $this->usuario();
        $reserva = $this->reservaDe($usuario, $this->charla());
        Asistencia::create([
            'reserva_id'     => $reserva->id,
            'registrada_por' => $this->usuario('acceso')->id,
            'qr_ventana'     => 1,
            'registrada_en'  => now(),
        ]);
        Sanctum::actingAs($usuario);

        $this->deleteJson("/api/reservas/{$reserva->id}")
            ->assertConflict()
            ->assertJsonPath('message', 'Ya consta tu asistencia a esta charla.');
    }

    private function reservaDe(Usuario $usuario, Charla $charla, string $estado = 'confirmada'): Reserva
    {
        return Reserva::create([
            'codigo'     => Str::upper(Str::random(10)),
            'usuario_id' => $usuario->id,
            'charla_id'  => $charla->id,
            'estado'     => $estado,
        ]);
    }
}
