<?php

namespace Database\Seeders;

use App\Models\Charla;
use App\Models\Reserva;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ReservaSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = fn (string $email) => Usuario::where('email', $email)->value('id');
        $charla  = fn (string $titulo) => Charla::where('titulo', $titulo)->value('id');

        $reservas = [
            // Docker (aforo 2): dos confirmadas = charla completa, y una cancelada de ejemplo.
            ['asistente1@sabitech.test', 'Docker para desarrolladores', 'confirmada'],
            ['asistente2@sabitech.test', 'Docker para desarrolladores', 'confirmada'],
            ['asistente3@sabitech.test', 'Docker para desarrolladores', 'cancelada'],
            // Una reserva normal.
            ['asistente1@sabitech.test', 'Introduccion a Laravel', 'confirmada'],
            // Reserva en la charla con el QR abierto.
            ['asistente2@sabitech.test', 'Demo en curso (prueba del QR)', 'confirmada'],
        ];

        foreach ($reservas as [$email, $titulo, $estado]) {
            Reserva::firstOrCreate(
                ['usuario_id' => $usuario($email), 'charla_id' => $charla($titulo)],
                [
                    'codigo'        => strtoupper(Str::random(10)),
                    'estado'        => $estado,
                    'confirmada_en' => now(),
                    'cancelada_en'  => $estado === 'cancelada' ? now() : null,
                ]
            );
        }
    }
}