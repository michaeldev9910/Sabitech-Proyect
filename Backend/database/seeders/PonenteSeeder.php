<?php

namespace Database\Seeders;

use App\Models\Ponente;
use Illuminate\Database\Seeder;

class PonenteSeeder extends Seeder
{
    public function run(): void
    {
        // Personas ficticias: no se usan datos reales.
        $ponentes = [
            ['nombre' => 'Laura',  'apellidos' => 'Martinez Ortega', 'organizacion' => 'Estudio Cobalto',  'biografia' => 'Desarrolladora backend especializada en PHP y APIs.'],
            ['nombre' => 'Daniel', 'apellidos' => 'Ferrer Soler',    'organizacion' => 'Nube Digital',     'biografia' => 'Ingeniero de plataformas, trabaja con contenedores y despliegue.'],
            ['nombre' => 'Marta',  'apellidos' => 'Quiles Peris',    'organizacion' => 'Pixel y Datos',    'biografia' => 'Disenadora de interfaces y especialista en accesibilidad.'],
            ['nombre' => 'Hugo',   'apellidos' => 'Lopez Gil',       'organizacion' => null,               'biografia' => 'Desarrollador frontend con React y TypeScript.'],
        ];

        foreach ($ponentes as $ponente) {
            Ponente::firstOrCreate(
                ['nombre' => $ponente['nombre'], 'apellidos' => $ponente['apellidos']],
                $ponente
            );
        }
    }
}