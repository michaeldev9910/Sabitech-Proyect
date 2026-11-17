# Plan del correo de confirmación de SABITECH WEB

Diseño del correo que recibe una persona al **confirmar una reserva**.
Estado: **diseño para el checkpoint** (17/11/2026). Se programa en la semana 8 (7-13 de diciembre).

---

## 1. Qué se pide (enunciado, apartados 4.4 y 4.9)

- Una reserva confirmada genera un correo con **actividad, fecha, horario, ubicación y una referencia** para reconocerla.
- El correo **no es un registro de asistencia**.
- En pruebas se usa un **buzón de laboratorio** donde se pueda comprobar el envío y el contenido.
- Si el correo **falla**, la reserva **sigue guardada e identificable**, la aplicación muestra el estado real y se puede **reintentar sin crear otra reserva**.
- Las **credenciales** del servicio de correo van **fuera del repositorio**.

## 2. Lo que ya tenemos

| Pieza | Estado |
|---|---|
| Envío de correo con Laravel (`Mail`) | ✅ Funciona en el formulario de contacto (`MensajeContacto`, 3 tests) |
| **Mailpit**, el buzón de laboratorio | ✅ En `compose.yaml`. Los correos se ven en `http://localhost:8025` |
| Configuración del correo en `backend/.env` (`MAIL_HOST=mailpit`) | ✅ Sin claves en el repositorio |
| Tabla `notificaciones` (estado, intentos, último error) | ✅ Existe |
| `NotificacionController`: la organización ve los correos y filtra los fallidos | ✅ Hecho |
| Código único de reserva (`K7Q2M9XA4B`) | ✅ Se genera al reservar |

**Falta:** el correo de la reserva (`ReservaConfirmada`), crearlo al reservar, la ruta para reintentar y mostrar el estado en "Mis reservas".

---

## 3. Contenido del correo

**Asunto:** `[Sabitech] Reserva confirmada: <título de la charla>`

**Cuerpo** (versión HTML y versión de texto, igual que el de contacto):

> Hola **Ana**,
>
> Tu plaza está **confirmada**.
>
> | | |
> |---|---|
> | **Charla** | IA aplicada a la salud |
> | **Ponentes** | Laura Martín, Pablo Ruiz |
> | **Fecha** | martes, 25 de noviembre de 2026 |
> | **Horario** | 10:00 – 11:00 |
> | **Lugar** | Auditorio · Planta baja |
> | **Código de reserva** | **K7Q2M9XA4B** |
>
> El día de la charla, abre **Mis reservas** en la web para mostrar tu **código QR** en la entrada. Si no puedes usar el QR, di tu código de reserva al personal.
>
> **Este correo no registra tu asistencia**: la asistencia se registra al entrar a la sala.
>
> Puedes cancelar la reserva desde Mis reservas **hasta 24 h antes** del inicio.
>
> [Ver mis reservas]
>
> *SABITECH · Jornadas tecnológicas*

**Destinatario:** el email de la cuenta que ha reservado.

## 4. Cuándo se envía

1. El usuario hace `POST /api/reservas`.
2. La reserva se guarda en su **transacción** (como ahora).
3. **Después de confirmar la transacción**, se crea una fila en `notificaciones` con estado `pendiente` y se envía el correo.
4. Si el envío va bien: `estado = enviada` y se guarda `enviada_en`.
5. Si falla: `estado = fallida`, se suma 1 a `intentos` y se guarda el motivo en `ultimo_error`.
6. **En los dos casos la respuesta es 201** y la reserva está guardada. El correo **nunca deshace la reserva**.

**Por qué después de la transacción:** si el correo se enviara dentro, un fallo del servidor de correo podría anular la reserva o dejar el bloqueo de la charla abierto más tiempo. Así primero se asegura la plaza y luego se avisa.

**También se envía** cuando una reserva cancelada se **reactiva**: es una nueva confirmación, así que se crea una notificación nueva para la misma reserva.

## 5. Si el correo falla

| Qué pasa | Cómo se ve |
|---|---|
| La reserva sigue `confirmada` y con su código | En "Mis reservas", como siempre |
| El asistente ve que el correo no ha llegado | En su tarjeta de reserva: "⚠️ No pudimos enviarte el correo · **Reenviar**" |
| La organización ve los correos fallidos | `GET /api/notificaciones?estado=fallida` *(ya hecho)* |
| El fallo queda registrado | `ultimo_error` en la notificación y en el log de Laravel. Al usuario solo se le dice "inténtalo más tarde", sin detalles técnicos |

### Reintentar sin crear otra reserva (ruta nueva)
`POST /api/reservas/{reserva}/reenviar-confirmacion`
- Solo el **dueño** de la reserva (o la organización).
- Solo si la reserva está **confirmada**.
- **Reutiliza la última notificación** de esa reserva: suma 1 a `intentos` y vuelve a enviar. **No crea ninguna reserva nueva** ni toca el aforo.
- Máximo **5 intentos** por notificación y como mucho **1 cada minuto**, para no saturar el servicio.

| Respuesta | Cuándo |
|---|---|
| 200 `Correo enviado` | Ha funcionado |
| 503 `No se pudo enviar el correo. Inténtalo más tarde.` | Ha vuelto a fallar (la reserva sigue bien) |
| 409 `El correo ya se envió.` | Ya estaba enviado |
| 409 `La reserva está cancelada.` | Reserva cancelada |
| 429 | Más de 1 intento por minuto o más de 5 en total |
| 404 | La reserva no existe o es de otra persona |

## 6. Entornos y credenciales

| Entorno | Servicio | Dónde se ven los correos |
|---|---|---|
| **Desarrollo y pruebas** | **Mailpit** (contenedor de Docker) | `http://localhost:8025`. No sale ningún correo a internet |
| **Demostración final** | **Resend** (ya preparado en `.env.example`) | Buzón real de laboratorio del equipo |

- Las claves (`RESEND_API_KEY`, usuario y contraseña SMTP) van **solo en `backend/.env`**, que no se sube a GitHub. En `.env.example` aparecen vacías.
- Para probar fallos: parar Mailpit (`docker compose stop mailpit`) y reservar. La reserva se guarda y la notificación queda `fallida`.

## 7. Pruebas previstas (diciembre)

Con `Mail::fake()`, como en `ContactoTest`:

| Test | Resultado esperado |
|---|---|
| Reservar envía el correo | Se envía `ReservaConfirmada` a la persona con título, fecha, sala y código |
| La notificación queda enviada | `estado = enviada`, `intentos = 1` |
| Si el correo falla, la reserva se guarda igual | 201, reserva confirmada, notificación `fallida` con su error |
| Reenviar no crea otra reserva | Sigue habiendo 1 reserva y 1 notificación; `intentos` sube |
| No se reenvía un correo ya enviado | 409 |
| No se reenvía el correo de otra persona | 404 |
| No se reenvía si la reserva está cancelada | 409 |
| Reactivar una reserva cancelada envía otro correo | 2 notificaciones para la misma reserva |

**Evidencia para la memoria:** captura de Mailpit con el correo recibido (destinatario de laboratorio, asunto y contenido) y captura de la notificación `fallida` con Mailpit parado.

## 8. Lo que se programará

| Pieza | Dónde |
|---|---|
| `ReservaConfirmada` (Mailable) | `app/Mail/ReservaConfirmada.php` |
| Vistas del correo (HTML y texto) | `resources/views/correos/reserva-confirmada*.blade.php` |
| Crear y enviar la notificación al reservar | `ReservaController::store`, después de la transacción |
| Reenviar | `ReservaController::reenviarConfirmacion` + ruta nueva |
| Estado del correo en cada reserva | `GET /mis-reservas` devuelve también la última notificación |
| Aviso y botón "Reenviar" | Tarjeta de reserva en el frontend |
| Tests | `tests/Feature/CorreoReservaTest.php` |

## 9. Decisión: envío directo, sin cola

El correo se envía **en el momento**, igual que el de contacto, y no con una cola de tareas.
- **Ventaja:** más simple de programar, de probar y de explicar. El usuario sabe enseguida si se ha enviado.
- **Inconveniente:** la respuesta tarda un poco más mientras se envía.
- Si en el futuro hubiera muchas reservas a la vez, se podría pasar a una **cola** (`QUEUE_CONNECTION=database` ya está configurado). La tabla `notificaciones` ya sirve para eso.
