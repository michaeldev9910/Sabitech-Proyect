<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Los helpers se cargan aquí y no con "autoload > files" de composer.json:
        // vendor/ no está en git y es el mismo para todas las ramas, así que no
        // debe depender de archivos que solo existen en algunas.
        require_once app_path('helpers.php');
    }

    public function boot(): void
    {
    }
}
