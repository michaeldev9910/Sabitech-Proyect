<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['reserva_id', 'destinatario', 'asunto', 'estado', 'intentos', 'ultimo_error', 'enviada_en'])]
class Notificacion extends Model
{
    protected $table = 'notificaciones';

    protected $fillable = ['reserva_id', 'destinatario', 'asunto', 'estado', 'intentos', 'ultimo_error', 'enviada_en'];

    protected function casts(): array{

        return [
            'intentos' => 'integer',
            'enviada_en' => 'datetime',
        ];
    }

    public function reserva(): BelongsTo
    {
        return $this->belongsTo(Reserva::class, 'reserva_id');
    }
}
