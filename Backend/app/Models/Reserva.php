<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['codigo', 'usuario_id', 'charla_id', 'estado', 'confirmada_en', 'cancelada_en', 'qr_semilla', 'qr_renovado_en'])]
class Reserva extends Model
{
    protected $table = 'reservas';

    protected $fillable = ['codigo', 'usuario_id', 'charla_id', 'estado', 'confirmada_en', 'cancelada_en', 'qr_semilla', 'qr_renovado_en'];

    protected $hidden = ['qr_semilla'];

    protected function casts(): array{

        return [
            'confirmada_en' => 'datetime',
            'cancelada_en' => 'datetime',
            'qr_renovado_en' => 'datetime',
        ];
    } 

    public function usuario(): BelongsTo{

        return $this->belongsTo(Usuario::class, 'usuario_id');

    }

    public function charla(): BelongsTo{

        return $this->belongsTo(Charla::class, 'charla_id');

    }

    public function asistencia(): HasOne{

        return $this->hasOne(Asistencia::class, 'reserva_id');

    }

    public function notificaciones(): HasMany{

        return $this->hasMany(Notificacion::class, 'reserva_id');

    }
}
