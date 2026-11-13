<?php

/*
|--------------------------------------------------------------------------
| Helpers propios de SaBiTech
|--------------------------------------------------------------------------
| Funciones globales que se pueden usar en cualquier parte de la aplicación
| (controladores, vistas Blade, etc.). Composer carga este archivo gracias a
| la sección "autoload" > "files" de composer.json.
|
| El "if (! function_exists(...))" evita un error si algún paquete ya tiene
| una función con el mismo nombre.
*/

if (! function_exists('fecha_charla')) {
    /**
     * Fecha y hora de una charla en formato español: 14/11/2026 · 18:30
     */
    function fecha_charla(?DateTimeInterface $fecha): string
    {
        return $fecha ? $fecha->format('d/m/Y · H:i') : 'Fecha por confirmar';
    }
}
