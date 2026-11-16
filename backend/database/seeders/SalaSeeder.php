<?php

namespace Database\Seeders;

use App\Models\Sala;
use Illuminate\Database\Seeder;

class SalaSeeder extends Seeder
{
    public function run(): void
    {
        $salas = [
            ['nombre' => 'Sala Magna',   'ubicacion' => 'Planta baja',     'capacidad' => 100],
            ['nombre' => 'Aula 1',       'ubicacion' => 'Primera planta',  'capacidad' => 40],
            ['nombre' => 'Aula 2',       'ubicacion' => 'Primera planta',  'capacidad' => 30],
            ['nombre' => 'Laboratorio',  'ubicacion' => 'Segunda planta',  'capacidad' => 20],
        ];

        foreach ($salas as $sala) {
            Sala::updateOrCreate(['nombre' => $sala['nombre']], $sala);
        }
    }
}