<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRol
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $usuario = $request->user();

        if (! $usuario) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        if (! $usuario->activo) {
            return response()->json(['message' => 'Cuenta desactivada.'], 403);
        }

        if (! $usuario->tieneRol(...$roles)) {
            return response()->json(['message' => 'No tienes permiso para esta accion.'], 403);
        }

        return $next($request);
    }
}