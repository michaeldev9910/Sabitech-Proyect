<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $rol = fn (string $codigo) => Rol::where('codigo', $codigo)->value('id');

        $usuarios = [
            ['rol' => 'organizacion', 'nombre' => 'Olga',   'apellidos' => 'Organizacion Demo', 'email' => 'organizacion@sabitech.test'],
            ['rol' => 'acceso',       'nombre' => 'Aitor',  'apellidos' => 'Acceso Demo',       'email' => 'acceso@sabitech.test'],
            ['rol' => 'asistente',    'nombre' => 'Ana',    'apellidos' => 'Asistente Uno',     'email' => 'asistente1@sabitech.test'],
            ['rol' => 'asistente',    'nombre' => 'Bruno',  'apellidos' => 'Asistente Dos',     'email' => 'asistente2@sabitech.test'],
            ['rol' => 'asistente',    'nombre' => 'Carla',  'apellidos' => 'Asistente Tres',    'email' => 'asistente3@sabitech.test'],
        ];

        foreach ($usuarios as $u) {
            Usuario::updateOrCreate(
                ['email' => $u['email']],
                [
                    'rol_id'    => $rol($u['rol']),
                    'nombre'    => $u['nombre'],
                    'apellidos' => $u['apellidos'],
                    'password'  => 'password',
                    'activo'    => true,
                ]
            );
        }
    }
}