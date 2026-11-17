<?php

namespace Tests;

use App\Models\Charla;
use App\Models\Ponente;
use App\Models\Reserva;
use App\Models\Rol;
use App\Models\Sala;
use App\Models\Usuario;
use Illuminate\Support\Str;

/**
 * Atajos para crear los datos que necesitan los tests de la API.
 */
trait CreaDatos
{
    protected function usuario(string $rol = 'asistente'): Usuario
    {
        $rol = Rol::firstOrCreate(['codigo' => $rol], ['nombre' => Str::ucfirst($rol)]);

        return Usuario::create([
            'rol_id'    => $rol->id,
            'nombre'    => 'Persona',
            'apellidos' => 'De Prueba',
            'email'     => Str::lower(Str::random(10)) . '@sabitech.test',
            'password'  => 'password',
            'activo'    => true,
        ]);
    }

    protected function ponente(string $nombre = 'Laura'): Ponente
    {
        return Ponente::create(['nombre' => $nombre, 'apellidos' => 'De Prueba']);
    }

    protected function sala(int $capacidad = 50): Sala
    {
        return Sala::create(['nombre' => 'Sala ' . Str::random(6), 'capacidad' => $capacidad]);
    }

    /**
     * Charla publicada dentro de 3 días: como faltan menos de 7, las reservas ya están abiertas.
     */
    protected function charla(array $datos = []): Charla
    {
        $inicio = now()->addDays(3)->startOfHour();

        return Charla::create([
            'sala_id' => $this->sala()->id,
            'titulo'  => 'Charla de prueba',
            'inicio'  => $inicio,
            'fin'     => $inicio->copy()->addHour(),
            'aforo'   => 20,
            'estado'  => 'publicada',
            ...$datos,
        ]);
    }

    protected function reserva(Usuario $usuario, Charla $charla, string $estado = 'confirmada'): Reserva
    {
        return Reserva::create([
            'codigo'     => Str::upper(Str::random(10)),
            'usuario_id' => $usuario->id,
            'charla_id'  => $charla->id,
            'estado'     => $estado,
        ]);
    }
}
