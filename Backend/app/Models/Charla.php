<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['ponente_id', 'sala_id', 'titulo', 'descripcion', 'inicio', 'fin', 'apertura_plazas', 'aforo', 'estado'])]
class Charla extends Model
{
    protected $table = 'charlas';

    protected $fillable = ['ponente_id', 'sala_id', 'titulo', 'descripcion', 'inicio', 'fin', 'apertura_plazas', 'aforo', 'estado'];

    protected $appends = ['plazas_libres'];

    protected function casts(): array {
        
        return [
            'inicio' => 'datetime',
            'fin' => 'datetime',
            'apertura_plazas' => 'datetime',
            'aforo' => 'integer',
        ];        
    }

    public function ponente(): BelongsTo{

        return $this->belongsTo(Ponente::class, 'ponente_id');

    }

    public function sala(): BelongsTo{

        return $this->belongsTo(Sala::class, 'sala_id');

    }

    public function reservas(): HasMany{

        return $this->hasMany(Reserva::class, 'charla_id');

    }

    public function reservasConfirmadas(): HasMany{

        return $this->hasMany(Reserva::class, 'charla_id')->where('estado', 'confirmada');

    }

    public function getPlazasLibresAttribute(): int {

        $ocupadas = $this->reservas_confirmadas_count ?? $this->reservasConfirmadas()->count();

        return max(0, $this->aforo - $ocupadas);
    }
}
