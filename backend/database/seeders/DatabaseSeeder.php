<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolSeeder::class,
            SalaSeeder::class,
            PonenteSeeder::class,
            UsuarioSeeder::class,
            CharlaSeeder::class,
            ReservaSeeder::class,
        ]);
    }
}