<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use Illuminate\Http\JsonResponse;

/**
 * Roles de la aplicación (solo organización). Son de solo lectura: EnsureRol y el
 * registro dependen de sus códigos (asistente, organizacion, acceso), así que no se
 * crean, editan ni borran desde la API. Los carga RolSeeder.
 */
class RolController extends Controller
{
    /**
     * GET /api/roles → todos los roles con cuántos usuarios tiene cada uno.
     */
    public function index(): JsonResponse
    {
        return response()->json(Rol::withCount('usuarios')->orderBy('nombre')->get());
    }

    /**
     * GET /api/roles/{rol}
     */
    public function show(Rol $rol): JsonResponse
    {
        return response()->json($rol->loadCount('usuarios'));
    }
}
