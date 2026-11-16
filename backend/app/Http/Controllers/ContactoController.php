<?php

namespace App\Http\Controllers;

use App\Mail\MensajeContacto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Controlador de una sola acción (__invoke).
 * POST /api/contacto → envía el formulario de contacto por correo. No guarda nada en la base de datos.
 */
class ContactoController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        // Honeypot: "web" es un campo oculto que una persona no ve ni rellena.
        // Si llega con contenido es un bot: respondemos como si todo fuera bien y no enviamos nada.
        if ($request->filled('web')) {
            return response()->json(['mensaje' => 'Mensaje enviado']);
        }

        $datos = $request->validate([
            // not_regex: sin saltos de línea, porque nombre y asunto van en las cabeceras del correo
            'nombre'     => ['required', 'string', 'max:100', 'not_regex:/[\r\n]/'],
            'email'      => ['required', 'email', 'max:255'],
            'asunto'     => ['required', 'string', 'max:150', 'not_regex:/[\r\n]/'],
            'mensaje'    => ['required', 'string', 'min:10', 'max:5000'],
            'privacidad' => ['accepted'],
        ], [
            'required'            => 'Este campo es obligatorio.',
            'email.email'         => 'Escribe un correo electrónico válido.',
            'max'                 => 'No puede tener más de :max caracteres.',
            'mensaje.min'         => 'El mensaje debe tener al menos :min caracteres.',
            'not_regex'           => 'No puede contener saltos de línea.',
            'privacidad.accepted' => 'Tienes que aceptar el uso de tus datos para poder responderte.',
        ]);

        try {
            Mail::to(config('contacto.destino'))->send(new MensajeContacto(
                nombre: $datos['nombre'],
                email: $datos['email'],
                asunto: $datos['asunto'],
                mensaje: $datos['mensaje'],
            ));
        } catch (Throwable $error) {
            // El detalle va al log; a quien escribe solo le decimos que lo intente más tarde
            report($error);

            return response()->json([
                'message' => 'No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.',
            ], 503);
        }

        return response()->json(['mensaje' => 'Mensaje enviado']);
    }
}
