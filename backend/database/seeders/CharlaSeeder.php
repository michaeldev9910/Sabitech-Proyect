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
        $ponentes = fn (array $nombres) => Ponente::whereIn('nombre', $nombres)->pluck('id');
        $sala     = fn (string $nombre) => Sala::where('nombre', $nombre)->value('id');
        // $dia(días desde hoy, hora en España). Se guarda en UTC, que es lo que espera la API
        $dia = fn (int $dias, int $hora) => now('Europe/Madrid')->addDays($dias)->setTime($hora, 0)->utc();

        $charlas = [
            [
                'titulo' => 'Introduccion a Laravel', 'ponentes' => ['Laura'], 'sala' => 'Sala Magna',
                'inicio' => $dia(20, 12), 'aforo' => 60, 'estado' => 'publicada',
                'descripcion' => 'Rutas, controladores y Eloquent para crear una API.',
            ],
            [
                'titulo' => 'React desde cero', 'ponentes' => ['Hugo'], 'sala' => 'Aula 1',
                'inicio' => $dia(7, 12), 'aforo' => 35, 'estado' => 'publicada',
                'descripcion' => 'Componentes, estado y consumo de una API.',
            ],
            [
                'titulo' => 'Docker para desarrolladores', 'ponentes' => ['Daniel'], 'sala' => 'Laboratorio',
                'inicio' => $dia(20, 10), 'aforo' => 2, 'estado' => 'publicada',
                'descripcion' => 'Contenedores para un entorno de desarrollo reproducible.',
            ],
            [
                'titulo' => 'Accesibilidad en interfaces web', 'ponentes' => ['Marta'], 'sala' => 'Aula 2',
                'inicio' => $dia(30, 12), 'aforo' => 25, 'estado' => 'publicada',
                'descripcion' => 'Etiquetas, foco, contraste y navegacion por teclado.',
            ],
            [
                // Charla con dos ponentes
                'titulo' => 'Seguridad en aplicaciones web', 'ponentes' => ['Laura', 'Daniel'], 'sala' => 'Aula 1',
                'inicio' => $dia(7, 12), 'aforo' => 30, 'estado' => 'publicada',
                'descripcion' => 'Charla en preparacion.',
            ],
            [
                'titulo' => 'Taller de testing (cancelado)', 'ponentes' => ['Hugo'], 'sala' => 'Aula 2',
                'inicio' => $dia(1, 12), 'aforo' => 20, 'estado' => 'publicada',
                'descripcion' => 'Charla cancelada por el ponente.',
            ],
            [
                'titulo' => 'Demo en curso (prueba del QR)', 'ponentes' => ['Daniel'], 'sala' => 'Sala Magna',
                'inicio' => now()->subMinutes(10), 'fin' => now()->addHours(2),
                'aforo' => 50, 'estado' => 'publicada',
                'descripcion' => 'Charla con el plazo de QR abierto, solo para pruebas.',
            ],
        ];

        foreach ($charlas as $c) {
            $inicio = $c['inicio'];

            $charla = Charla::updateOrCreate(
                ['titulo' => $c['titulo']],
                [
                    'sala_id'         => $sala($c['sala']),
                    'descripcion'     => $c['descripcion'],
                    'inicio'          => $inicio,
                    'fin'             => $c['fin'] ?? $inicio->copy()->addHour(),
                    // La apertura de reservas la pone el modelo: 7 días antes del inicio
                    'aforo'           => $c['aforo'],
                    'estado'          => $c['estado'],
                ]
            );

            $charla->ponentes()->sync($ponentes($c['ponentes']));
        }
    }
}
