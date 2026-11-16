<?php

namespace Tests\Feature;

use App\Mail\MensajeContacto;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactoTest extends TestCase
{
    private const DATOS = [
        'nombre'     => 'Ada Lovelace',
        'email'      => 'ada@example.com',
        'asunto'     => 'Propuesta de charla',
        'mensaje'    => 'Me gustaría proponer una charla sobre computación.',
        'privacidad' => true,
    ];

    public function test_envia_el_mensaje_al_buzon_de_contacto(): void
    {
        Mail::fake();
        config(['contacto.destino' => 'organizacion@example.com']);

        $this->postJson('/api/contacto', self::DATOS)
            ->assertOk()
            ->assertJson(['mensaje' => 'Mensaje enviado']);

        Mail::assertSent(MensajeContacto::class, function (MensajeContacto $correo) {
            return $correo->hasTo('organizacion@example.com')
                && $correo->hasReplyTo('ada@example.com')
                && $correo->hasSubject('[Sabitech] Propuesta de charla');
        });
    }

    public function test_no_envia_nada_si_faltan_datos(): void
    {
        Mail::fake();

        $this->postJson('/api/contacto', ['nombre' => 'Ada'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'asunto', 'mensaje', 'privacidad']);

        Mail::assertNothingSent();
    }

    public function test_descarta_en_silencio_los_envios_de_bots(): void
    {
        Mail::fake();

        $this->postJson('/api/contacto', [...self::DATOS, 'web' => 'https://spam.example'])
            ->assertOk();

        Mail::assertNothingSent();
    }
}
