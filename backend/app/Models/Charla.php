<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Charla extends Model
{
    protected $table = 'charlas';

    // Las reservas se abren 7 días antes del inicio (se cancelan hasta 24 h antes y el QR sale 30 min antes)
    public const DIAS_APERTURA_RESERVAS = 7;

    // apertura_plazas no se rellena a mano: la calcula booted() a partir del inicio
    protected $fillable = ['sala_id', 'titulo', 'descripcion', 'inicio', 'fin', 'aforo', 'estado'];

    protected $appends = ['plazas_libres'];

    protected static function booted(): void
    {
        // Cada vez que se guarda la charla, la apertura queda DIAS_APERTURA_RESERVAS días antes del inicio
        static::saving(function (Charla $charla) {
            $charla->apertura_plazas = $charla->inicio->copy()->subDays(self::DIAS_APERTURA_RESERVAS);
        });
    }

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
