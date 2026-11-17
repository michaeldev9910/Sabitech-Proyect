<?php

namespace Tests\Feature;

use App\Models\Notificacion;
use App\Models\Reserva;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreaDatos;
use Tests\TestCase;

class NotificacionTest extends TestCase
{
    use CreaDatos, RefreshDatabase;

    public function test_la_organizacion_ve_las_notificaciones_y_filtra_por_estado(): void
    {
        $reserva = $this->reserva($this->usuario(), $this->charla());
        $this->notificacionDe($reserva, 'enviada');
        $fallida = $this->notificacionDe($reserva, 'fallida');
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->getJson('/api/notificaciones')->assertOk()->assertJsonCount(2);
        $this->getJson('/api/notificaciones?estado=fallida')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $fallida->id)
            ->assertJsonPath('0.reserva.codigo', $reserva->codigo);
    }

    public function test_la_organizacion_ve_una_notificacion_con_su_reserva(): void
    {
        $reserva = $this->reserva($this->usuario(), $this->charla());
        $notificacion = $this->notificacionDe($reserva, 'pendiente');
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->getJson("/api/notificaciones/{$notificacion->id}")
            ->assertOk()
            ->assertJsonPath('reserva.usuario.email', $reserva->usuario->email)
            ->assertJsonPath('reserva.charla.titulo', 'Charla de prueba');
    }

    public function test_un_estado_que_no_existe_da_422(): void
    {
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->getJson('/api/notificaciones?estado=rara')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('estado');
    }

    public function test_solo_la_organizacion_ve_las_notificaciones(): void
    {
        Sanctum::actingAs($this->usuario('asistente'));

        $this->getJson('/api/notificaciones')->assertForbidden();
    }

    private function notificacionDe(Reserva $reserva, string $estado): Notificacion
    {
        return Notificacion::create([
            'reserva_id'   => $reserva->id,
            'destinatario' => $reserva->usuario->email,
            'asunto'       => 'Tu reserva',
            'estado'       => $estado,
        ]);
    }
}
