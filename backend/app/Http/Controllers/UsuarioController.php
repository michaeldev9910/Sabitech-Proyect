<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Gestión de usuarios por la organización: verlos, cambiarles el rol y activar o
 * desactivar su cuenta. Las cuentas se crean con POST /register (AuthController) y
 * no se borran: tienen reservas asociadas, así que se desactivan.
 */
class UsuarioController extends Controller
{
    /**
     * GET /api/usuarios → todos los usuarios con su rol. Con ?rol=acceso filtra por rol.
     */
    public function index(Request $request): JsonResponse
    {
        $filtro = $request->validate([
            'rol' => 'nullable|string|exists:roles,codigo',
        ]);

        $usuarios = Usuario::with('rol')
            ->withCount('reservas')
            ->when($filtro['rol'] ?? null, fn ($consulta, $codigo) => $consulta->whereRelation('rol', 'codigo', $codigo))
            ->orderBy('apellidos')
            ->orderBy('nombre')
            ->get();

        return response()->json($usuarios);
    }

    /**
     * GET /api/usuarios/{usuario}
     */
    public function show(Usuario $usuario): JsonResponse
    {
        return response()->json($usuario->load('rol')->loadCount('reservas'));
    }

    /**
     * PUT /api/usuarios/{usuario} → cambia el rol y/o activa o desactiva la cuenta.
     * Nombre, email y contraseña no se tocan aquí: son datos de la propia persona.
     */
    public function update(Request $request, Usuario $usuario): JsonResponse
    {
        // Si la organización se quitara su propio rol o se desactivara, podría quedarse sin nadie que gestione la web
        abort_if(
            $usuario->is($request->user()),
            422,
            'No puedes cambiar tu propio rol ni desactivar tu propia cuenta.',
        );

        $datos = $request->validate([
            'rol_id' => 'required_without:activo|integer|exists:roles,id',
            'activo' => 'required_without:rol_id|boolean',
        ], [
            'rol_id.required_without' => 'Indica el nuevo rol o si la cuenta está activa.',
            'rol_id.exists'           => 'El rol no existe.',
            'activo.required_without' => 'Indica el nuevo rol o si la cuenta está activa.',
        ]);

        $usuario->update($datos);

        // Una cuenta desactivada sale de todas sus sesiones al momento
        if (! $usuario->activo) {
            $usuario->tokens()->delete();
        }

        return response()->json($usuario->load('rol'));
    }
}
