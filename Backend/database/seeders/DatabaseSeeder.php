<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Usuario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = Role::query()->firstOrCreate(
            ['codigo' => 'admin'],
            ['nombre' => 'Administrador', 'descripcion' => 'Gestiona charlas, salas, ponentes y asistencias'],
        );

        Role::query()->firstOrCreate(
            ['codigo' => 'asistente'],
            ['nombre' => 'Asistente', 'descripcion' => 'Reserva plazas en las charlas'],
        );

        Usuario::factory()->create([
            'rol_id' => $admin->id,
            'nombre' => 'Usuario',
            'apellidos' => 'De Prueba',
            'email' => 'test@example.com',
        ]);
    }
}
