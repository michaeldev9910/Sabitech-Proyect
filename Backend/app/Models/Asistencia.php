<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['reserva_id', 'registrada_por', 'qr_ventana', 'registrada_en'])]
class Asistencia extends Model
{
    protected $table = 'asistencias';

    public $timestamps = false;

    protected $fillable = ['reserva_id', 'registrada_por', 'qr_ventana', 'registrada_en'];

    protected function casts(): array{

        return [
            'qr_ventana' => 'integer',
            'registrada_en' => 'datetime',
        ];
    }

    public function reserva(): BelongsTo{

        return $this->belongsTo(Reserva::class, 'reserva_id');

    }

    public function registradaPorUsuario(): BelongsTo{

        return $this->belongsTo(Usuario::class, 'registrada_por');
        
    }
}
