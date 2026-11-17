<?php

namespace Tests\Feature;

use App\Models\Rol;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreaDatos;
use Tests\TestCase;

class UsuarioTest extends TestCase
{
    use CreaDatos, RefreshDatabase;

    public function test_la_organizacion_lista_los_usuarios_y_filtra_por_rol(): void
    {
        $this->usuario('asistente');
        $this->usuario('acceso');
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->getJson('/api/usuarios')
            ->assertOk()
            ->assertJsonCount(3)
            ->assertJsonStructure([['id', 'nombre', 'email', 'activo', 'reservas_count', 'rol' => ['codigo']]])
            ->assertJsonMissingPath('0.password');

        $this->getJson('/api/usuarios?rol=acceso')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.rol.codigo', 'acceso');
    }

    public function test_la_organizacion_ve_un_usuario(): void
    {
        $usuario = $this->usuario();
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->getJson("/api/usuarios/{$usuario->id}")
            ->assertOk()
            ->assertJsonPath('email', $usuario->email)
            ->assertJsonPath('rol.codigo', 'asistente');
    }

    public function test_la_organizacion_cambia_el_rol_de_un_usuario(): void
    {
        $usuario = $this->usuario();
        $acceso = Rol::firstOrCreate(['codigo' => 'acceso'], ['nombre' => 'Acceso']);
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->putJson("/api/usuarios/{$usuario->id}", ['rol_id' => $acceso->id])
            ->assertOk()
            ->assertJsonPath('rol.codigo', 'acceso');
    }

    public function test_al_desactivar_una_cuenta_se_cierran_sus_sesiones(): void
    {
        $usuario = $this->usuario();
        $usuario->createToken('auth');
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->putJson("/api/usuarios/{$usuario->id}", ['activo' => false])
            ->assertOk()
            ->assertJsonPath('activo', false);

        $this->assertSame(0, $usuario->tokens()->count());
    }

    public function test_no_se_cambia_a_si_mismo(): void
    {
        $organizacion = $this->usuario('organizacion');
        Sanctum::actingAs($organizacion);

        $this->putJson("/api/usuarios/{$organizacion->id}", ['activo' => false])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'No puedes cambiar tu propio rol ni desactivar tu propia cuenta.');
    }

    public function test_hay_que_indicar_rol_o_activo(): void
    {
        $usuario = $this->usuario();
        Sanctum::actingAs($this->usuario('organizacion'));

        $this->putJson("/api/usuarios/{$usuario->id}", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['rol_id', 'activo']);
    }

    public function test_solo_la_organizacion_gestiona_usuarios(): void
    {
        $usuario = $this->usuario();

        foreach (['asistente', 'acceso'] as $rol) {
            Sanctum::actingAs($this->usuario($rol));

            $this->getJson('/api/usuarios')->assertForbidden();
            $this->putJson("/api/usuarios/{$usuario->id}", ['activo' => false])->assertForbidden();
        }
    }
}
