<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Correo que recibe la organización cuando alguien rellena el formulario de contacto.
 * No implementa ShouldQueue: se envía en el momento y los datos no pasan por la base de datos.
 */
class MensajeContacto extends Mailable
{
    public function __construct(
        public string $nombre,
        public string $email,
        public string $asunto,
        public string $mensaje,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Sabitech] ' . $this->asunto,
            // Al pulsar "Responder" se contesta a la persona, no al remitente técnico
            replyTo: [new Address($this->email, $this->nombre)],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contacto',
            text: 'emails.contacto-texto',
        );
    }
}
