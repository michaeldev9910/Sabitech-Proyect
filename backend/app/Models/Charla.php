<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Charla extends Model
{
    protected $table = 'charlas';

    protected $fillable = ['sala_id', 'titulo', 'descripcion', 'inicio', 'fin', 'apertura_plazas', 'aforo', 'estado'];

    protected $appends = ['plazas_libres'];

    protected function casts(): array {
        
        return [
            'inicio' => 'datetime',
            'fin' => 'datetime',
            'apertura_plazas' => 'datetime',
            'aforo' => 'integer',
        ];        
    }

    // Una charla puede tener varios ponentes (tabla intermedia charla_ponente)
    public function ponentes(): BelongsToMany{

        return $this->belongsToMany(Ponente::class, 'charla_ponente')->withTimestamps();

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
