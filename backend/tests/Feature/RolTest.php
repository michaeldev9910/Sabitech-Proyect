<?php

namespace Tests\Feature;

use App\Models\Rol;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreaDatos;
use Tests\TestCase;

class RolTest extends TestCase
{
    use CreaDatos, RefreshDatabase;

    public function test_la_organizacion_ve_los_roles_con_sus_usuarios(): void
    {
        $this->usuario('asistente');
        $this->usuario('asistente');
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->getJson('/api/roles')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['codigo' => 'asistente', 'usuarios_count' => 2]);

        $asistente = Rol::where('codigo', 'asistente')->first();

        $this->getJson("/api/roles/{$asistente->id}")
            ->assertOk()
            ->assertJsonPath('codigo', 'asistente')
            ->assertJsonPath('usuarios_count', 2);
    }

    public function test_los_roles_no_se_crean_desde_la_api(): void
    {
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->postJson('/api/roles', ['codigo' => 'nuevo', 'nombre' => 'Nuevo'])->assertMethodNotAllowed();
    }

    public function test_solo_la_organizacion_ve_los_roles(): void
    {
        Sanctum::actingAs($this->usuario('asistente'));

        $this->getJson('/api/roles')->assertForbidden();
    }
}
