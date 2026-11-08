<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * POST /api/register  (publico)
     * Crea una cuenta de asistente y devuelve un token de acceso.
     */
    public function register(Request $request): JsonResponse
    {
        // Los emails se guardan en minusculas para que la clave unica funcione bien.
        $request->merge(['email' => Str::lower(trim((string) $request->input('email')))]);

        $datos = $request->validate([
            'nombre'    => 'required|string|max:100',
            'apellidos' => 'required|string|max:150',
            'email'     => 'required|email|max:255|unique:usuarios,email',
            'password'  => 'required|string|min:8|max:255',
        ]);

        // El rol NUNCA viene de la peticion: quien se registra siempre es "asistente".
        $usuario = Usuario::create([
            'rol_id'    => Rol::where('codigo', 'asistente')->value('id'),
            'nombre'    => $datos['nombre'],
            'apellidos' => $datos['apellidos'],
            'email'     => $datos['email'],
            'password'  => $datos['password'], // el modelo lo guarda con hash
            'activo'    => true,
        ]);

        return response()->json([
            'usuario' => $usuario->load('rol'),
            'token'   => $usuario->createToken('auth')->plainTextToken,
        ], 201);
    }

    /**
     * POST /api/login  (publico)
     */
    public function login(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $usuario = Usuario::where('email', Str::lower(trim($datos['email'])))->first();

        // Mismo mensaje para todos los fallos: no se revela si un email esta registrado.
        if (! $usuario || ! Hash::check($datos['password'], $usuario->password) || ! $usuario->activo) {
            return response()->json(['message' => 'Credenciales incorrectas.'], 401);
        }

        return response()->json([
            'usuario' => $usuario->load('rol'),
            'token'   => $usuario->createToken('auth')->plainTextToken,
        ]);
    }

    /**
     * POST /api/logout  (requiere login)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['mensaje' => 'Sesion cerrada']);
    }

    /**
     * GET /api/me  (requiere login)
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('rol'));
    }
}