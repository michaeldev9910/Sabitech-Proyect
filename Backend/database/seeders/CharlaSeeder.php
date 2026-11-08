<?php

namespace Database\Seeders;

use App\Models\Charla;
use App\Models\Ponente;
use App\Models\Sala;
use Illuminate\Database\Seeder;

class CharlaSeeder extends Seeder
{
    public function run(): void
    {
        $ponente = fn (string $nombre) => Ponente::where('nombre', $nombre)->value('id');
        $sala    = fn (string $nombre) => Sala::where('nombre', $nombre)->value('id');

        // Las fechas son relativas a "hoy" para que la demo siempre tenga charlas futuras.
        $dia = fn (int $dias, int $hora) => now()->addDays($dias)->setTime($hora, 0);

        $charlas = [
            [
                'titulo' => 'Introduccion a Laravel', 'ponente' => 'Laura', 'sala' => 'Sala Magna',
                'inicio' => $dia(3, 10), 'aforo' => 60, 'estado' => 'publicada',
                'descripcion' => 'Rutas, controladores y Eloquent para crear una API.',
            ],
            [
                'titulo' => 'React desde cero', 'ponente' => 'Hugo', 'sala' => 'Aula 1',
                'inicio' => $dia(3, 12), 'aforo' => 35, 'estado' => 'publicada',
                'descripcion' => 'Componentes, estado y consumo de una API.',
            ],
            [
                // Aforo 2: sirve para probar "ultima plaza" y "charla completa".
                'titulo' => 'Docker para desarrolladores', 'ponente' => 'Daniel', 'sala' => 'Laboratorio',
                'inicio' => $dia(4, 10), 'aforo' => 2, 'estado' => 'publicada',
                'descripcion' => 'Contenedores para un entorno de desarrollo reproducible.',
            ],
            [
                'titulo' => 'Accesibilidad en interfaces web', 'ponente' => 'Marta', 'sala' => 'Aula 2',
                'inicio' => $dia(5, 11), 'aforo' => 25, 'estado' => 'publicada',
                'descripcion' => 'Etiquetas, foco, contraste y navegacion por teclado.',
            ],
            [
                // Borrador: no debe verse en el listado publico.
                'titulo' => 'Seguridad en aplicaciones web', 'ponente' => 'Laura', 'sala' => 'Aula 1',
                'inicio' => $dia(6, 10), 'aforo' => 30, 'estado' => 'borrador',
                'descripcion' => 'Charla en preparacion.',
            ],
            [
                // Cancelada: tampoco debe verse en el listado publico.
                'titulo' => 'Taller de testing (cancelado)', 'ponente' => 'Hugo', 'sala' => 'Aula 2',
                'inicio' => $dia(6, 12), 'aforo' => 20, 'estado' => 'cancelada',
                'descripcion' => 'Charla cancelada por el ponente.',
            ],
            [
                // Plazo del QR abierto ahora mismo (apertura <= ahora <= fin): para probar el QR.
                'titulo' => 'Demo en curso (prueba del QR)', 'ponente' => 'Daniel', 'sala' => 'Sala Magna',
                'inicio' => now()->subMinutes(10), 'fin' => now()->addHours(2),
                'apertura_plazas' => now()->subHours(2), 'aforo' => 50, 'estado' => 'publicada',
                'descripcion' => 'Charla con el plazo de QR abierto, solo para pruebas.',
            ],
        ];

        foreach ($charlas as $c) {
            $inicio = $c['inicio'];

            Charla::updateOrCreate(
                ['titulo' => $c['titulo']],
                [
                    'ponente_id'      => $ponente($c['ponente']),
                    'sala_id'         => $sala($c['sala']),
                    'descripcion'     => $c['descripcion'],
                    'inicio'          => $inicio,
                    'fin'             => $c['fin'] ?? $inicio->copy()->addHour(),
                    'apertura_plazas' => $c['apertura_plazas'] ?? $inicio->copy()->subDay(),
                    'aforo'           => $c['aforo'],
                    'estado'          => $c['estado'],
                ]
            );
        }
    }
}