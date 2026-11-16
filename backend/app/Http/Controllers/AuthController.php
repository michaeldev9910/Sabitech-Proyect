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
    public function register(Request $request): JsonResponse
    {
        $request->merge(['email' => Str::lower(trim((string) $request->input('email')))]);

        $datos = $request->validate([
            'nombre'    => 'required|string|max:100',
            'apellidos' => 'required|string|max:150',
            'email'     => 'required|email|max:255|unique:usuarios,email',
            'password'  => 'required|string|min:8|max:255',
        ]);

        $usuario = Usuario::create([
            'rol_id'    => Rol::where('codigo', 'asistente')->value('id'),
            'nombre'    => $datos['nombre'],
            'apellidos' => $datos['apellidos'],
            'email'     => $datos['email'],
            'password'  => $datos['password'],
            'activo'    => true,
        ]);

        return response()->json([
            'usuario' => $usuario->load('rol'),
            'token'   => $usuario->createToken('auth')->plainTextToken,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $usuario = Usuario::where('email', Str::lower(trim($datos['email'])))->first();

        if (! $usuario || ! Hash::check($datos['password'], $usuario->password) || ! $usuario->activo) {
            return response()->json(['message' => 'Credenciales incorrectas.'], 401);
        }

        return response()->json([
            'usuario' => $usuario->load('rol'),
            'token'   => $usuario->createToken('auth')->plainTextToken,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['mensaje' => 'Sesion cerrada']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('rol'));
    }
}