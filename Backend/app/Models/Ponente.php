<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nombre', 'apellidos', 'organizacion', 'biografia', 'foto_url'])]
class Ponente extends Model
{
    protected $table = 'ponentes';

    protected $fillable = ['nombre', 'apellidos', 'organizacion', 'biografia', 'foto_url'];

    public function charlas(): HasMany
    {
        return $this->hasMany(Charla::class, 'ponente_id');
    }
}
