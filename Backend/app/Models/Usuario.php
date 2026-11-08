<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuarios';

    protected $fillable = ['rol_id', 'nombre', 'apellidos', 'email', 'password', 'activo'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array{

        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed', // se guarda siempre con hash
            'activo' => 'boolean',
        ];
    }

    public function rol(): BelongsTo{

        return $this->belongsTo(Rol::class, 'rol_id');

    }

    public function reservas(): HasMany{

        return $this->hasMany(Reserva::class, 'usuario_id');
        
    }

    public function asistenciasRegistradas(): HasMany{

        return $this->hasMany(Asistencia::class, 'registrada_por');

    }

    public function tieneRol(string ...$codigos): bool{

        return in_array($this->rol?->codigo, $codigos, true);
        
    }
}