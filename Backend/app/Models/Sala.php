<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nombre', 'ubicacion', 'capacidad'])]
class Sala extends Model
{
    protected $table = 'salas';

    protected $fillable = ['nombre', 'ubicacion', 'capacidad'];

    protected function casts(): array {

        return ['capacidad' => 'integer',];

    }

    public function charlas(): HasMany{

        return $this->hasMany(Charla::class, 'sala_id');

    }
}
