<?php

namespace Database\Seeders;

use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    public function run(): void{
        
        $roles = [
            ['codigo' => 'asistente',    'nombre' => 'Asistente',    'descripcion' => 'Consulta charlas y gestiona sus reservas'],
            ['codigo' => 'organizacion', 'nombre' => 'Organizacion', 'descripcion' => 'Gestiona charlas, ponentes, salas y consulta inscripciones'],
            ['codigo' => 'acceso',       'nombre' => 'Acceso',       'descripcion' => 'Valida la asistencia escaneando el QR'],
        ];

        foreach ($roles as $rol) {
            Rol::updateOrCreate(['codigo' => $rol['codigo']], $rol);
        }
    }
}