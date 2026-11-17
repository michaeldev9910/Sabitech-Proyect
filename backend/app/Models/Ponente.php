<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Ponente extends Model
{
    protected $table = 'ponentes';

    protected $fillable = ['nombre', 'apellidos', 'organizacion', 'biografia', 'foto_url'];

    // Un ponente puede dar varias charlas y una charla tener varios ponentes
    public function charlas(): BelongsToMany
    {
        return $this->belongsToMany(Charla::class, 'charla_ponente')->withTimestamps();
    }
}
