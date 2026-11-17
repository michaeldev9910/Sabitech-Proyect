# API de SABITECH WEB

Documentación de la API REST del backend (Laravel 12 + Sanctum).
Versión documentada: `main` (commit `96d8505`) · Fecha: 17/11/2026

- **URL base (desarrollo con Docker):** `http://localhost:8080/api`
- **Formato:** todas las peticiones y respuestas van en JSON. Enviad siempre la cabecera `Accept: application/json`.
- **Rutas definidas en:** `backend/routes/api.php`

---

## 1. Autenticación

La API usa **tokens de Laravel Sanctum**.

1. El usuario hace `POST /login` (o `POST /register`) y recibe un `token`.
2. En las rutas protegidas, el frontend envía ese token en la cabecera:
   ```
   Authorization: Bearer <token>
   ```
3. Con `POST /logout` el token se borra y deja de valer.

Las contraseñas se guardan cifradas con el hash de Laravel; nunca se devuelven en las respuestas (`password` está oculto en el modelo `Usuario`).

## 2. Perfiles (roles)

| Rol            | Qué puede hacer                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _Sin sesión_   | Ver charlas, ponentes y salas; registrarse; iniciar sesión; enviar el formulario de contacto                                                                    |
| `asistente`    | Lo anterior + reservar, ver sus reservas y cancelarlas                                                                                                          |
| `organizacion` | Lo del asistente + crear, editar y cancelar charlas, ponentes y salas; gestionar usuarios; consultar roles, asistencias y notificaciones; registrar asistencias |
| `acceso`       | Personal de sala: **no reserva**; registra la asistencia con el código de la reserva (en febrero, con el QR temporal)                                           |

Los permisos se comprueban **en el servidor** con el middleware `EnsureRol`. Quien se registra siempre es `asistente`: el rol nunca se elige desde la petición.

---

## 3. Resumen de rutas

| #   | Método | Ruta                   | Quién                    | Qué hace                                                |
| --- | ------ | ---------------------- | ------------------------ | ------------------------------------------------------- |
| 1   | POST   | `/register`            | Público                  | Crea una cuenta de asistente                            |
| 2   | POST   | `/login`               | Público                  | Inicia sesión y devuelve un token                       |
| 3   | POST   | `/logout`              | Con sesión               | Cierra la sesión (borra el token)                       |
| 4   | GET    | `/me`                  | Con sesión               | Datos del usuario conectado                             |
| 5   | GET    | `/charlas`             | Público                  | Lista de charlas publicadas                             |
| 6   | GET    | `/charlas/{id}`        | Público                  | Detalle de una charla publicada                         |
| 7   | POST   | `/charlas`             | Organización             | Crea una charla                                         |
| 8   | PUT    | `/charlas/{id}`        | Organización             | Edita una charla                                        |
| 9   | DELETE | `/charlas/{id}`        | Organización             | Cancela una charla y sus reservas                       |
| 10  | GET    | `/ponentes`            | Público                  | Lista de ponentes                                       |
| 11  | GET    | `/ponentes/{id}`       | Público                  | Ponente con sus charlas publicadas                      |
| 12  | POST   | `/ponentes`            | Organización             | Crea un ponente                                         |
| 13  | PUT    | `/ponentes/{id}`       | Organización             | Edita un ponente                                        |
| 14  | DELETE | `/ponentes/{id}`       | Organización             | Borra un ponente sin charlas                            |
| 15  | GET    | `/salas`               | Público                  | Lista de salas                                          |
| 16  | GET    | `/salas/{id}`          | Público                  | Detalle de una sala                                     |
| 17  | GET    | `/salas/{id}/charlas`  | Público                  | Charlas publicadas en esa sala                          |
| 18  | POST   | `/salas`               | Organización             | Crea una sala                                           |
| 19  | PUT    | `/salas/{id}`          | Organización             | Edita una sala                                          |
| 20  | DELETE | `/salas/{id}`          | Organización             | Borra una sala sin charlas                              |
| 21  | GET    | `/mis-reservas`        | Asistente / Organización | Reservas del usuario conectado                          |
| 22  | POST   | `/reservas`            | Asistente / Organización | Reserva una plaza                                       |
| 23  | DELETE | `/reservas/{id}`       | Asistente / Organización | Cancela una reserva propia                              |
| 24  | POST   | `/contacto`            | Público                  | Envía el formulario de contacto por correo              |
| 25  | GET    | `/usuarios`            | Organización             | Lista de usuarios (filtro `?rol=`)                      |
| 26  | GET    | `/usuarios/{id}`       | Organización             | Detalle de un usuario                                   |
| 27  | PUT    | `/usuarios/{id}`       | Organización             | Cambia el rol o activa/desactiva la cuenta              |
| 28  | GET    | `/roles`               | Organización             | Lista de roles con cuántos usuarios tiene cada uno      |
| 29  | GET    | `/roles/{id}`          | Organización             | Detalle de un rol                                       |
| 30  | POST   | `/asistencias`         | Acceso / Organización    | Registra la asistencia con el código de la reserva      |
| 31  | GET    | `/asistencias`         | Organización             | Lista de asistencias (filtro `?charla_id=`)             |
| 32  | GET    | `/notificaciones`      | Organización             | Correos de confirmación y su estado (filtro `?estado=`) |
| 33  | GET    | `/notificaciones/{id}` | Organización             | Detalle de una notificación                             |

**Un controlador por tabla:** `roles` → `RolController` · `usuarios` → `AuthController` + `UsuarioController` · `salas` → `SalaController` (+ `CharlasDeSalaController`) · `ponentes` → `PonenteController` · `charlas` → `CharlaController` · `charla_ponente` → dentro de `CharlaController` (tabla intermedia) · `reservas` → `ReservaController` · `asistencias` → `AsistenciaController` · `notificaciones` → `NotificacionController`.

Todos los `{id}` deben ser números: `/charlas/abc` no llega al controlador (`whereNumber`).

---

## 4. Errores comunes

| Código  | Cuándo                                                                             | Ejemplo de respuesta                                                         |
| ------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **401** | Falta el token, ha caducado o las credenciales son incorrectas                     | `{"message": "Credenciales incorrectas."}`                                   |
| **403** | Tiene sesión pero su rol no permite la acción, o la cuenta está desactivada        | `{"message": "No tienes permiso para esta accion."}`                         |
| **404** | No existe, no está publicada o es una reserva de otra persona                      | `{"message": "No se ha encontrado la reserva."}`                             |
| **409** | Conflicto con el estado actual (sin plazas, reserva repetida, borrar algo en uso…) | `{"message": "No quedan plazas libres en esta charla."}`                     |
| **422** | Datos no válidos o regla de negocio incumplida                                     | `{"message": "...", "errors": {"campo": ["motivo"]}}`                        |
| **429** | Demasiados intentos (login y contacto: máx. 5 por minuto)                          | `{"message": "Too Many Attempts."}`                                          |
| **503** | El servicio de correo ha fallado                                                   | `{"message": "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde."}` |

Las respuestas de error nunca incluyen contraseñas, consultas SQL ni datos de otros usuarios.

---

## 5. Detalle de cada ruta

### Autenticación

#### 1 · `POST /register` — Crear cuenta

**Público.**

Cuerpo:

```json
{
  "nombre": "Ana",
  "apellidos": "García López",
  "email": "ana@example.com",
  "password": "contraseña-segura"
}
```

| Campo       | Reglas                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| `nombre`    | obligatorio, máx. 100                                                    |
| `apellidos` | obligatorio, máx. 150                                                    |
| `email`     | obligatorio, email válido, máx. 255, **único** (se guarda en minúsculas) |
| `password`  | obligatorio, mín. 8, máx. 255                                            |

✅ **201**

```json
{
  "usuario": {
    "id": 7,
    "nombre": "Ana",
    "email": "ana@example.com",
    "rol": { "codigo": "asistente" }
  },
  "token": "12|abc..."
}
```

❌ **422** email repetido o datos inválidos.

#### 2 · `POST /login` — Iniciar sesión

**Público.** Máximo 5 intentos por minuto.

Cuerpo: `{ "email": "ana@example.com", "password": "contraseña-segura" }`

✅ **200** igual que el registro: `usuario` + `token`.
❌ **401** `Credenciales incorrectas.` (mismo mensaje si el email no existe, la contraseña está mal o la cuenta está desactivada: así no se revela qué emails están registrados).
❌ **429** más de 5 intentos en un minuto.

#### 3 · `POST /logout` — Cerrar sesión

**Con sesión.** Borra el token actual.

✅ **200** `{ "mensaje": "Sesion cerrada" }`

#### 4 · `GET /me` — Usuario conectado

**Con sesión.** Lo usa el frontend al recargar la página para saber si el token sigue valiendo.

✅ **200** el usuario con su `rol`.
❌ **401** token caducado → el frontend cierra la sesión y avisa.

---

### Charlas

#### 5 · `GET /charlas` — Programa

**Público.** Solo charlas con `estado = publicada`, ordenadas por fecha de inicio.

✅ **200**

```json
[
  {
    "id": 3,
    "titulo": "IA aplicada a la salud",
    "descripcion": "...",
    "inicio": "2026-11-25T10:00:00",
    "fin": "2026-11-25T11:00:00",
    "apertura_plazas": "2026-11-18T10:00:00",
    "aforo": 40,
    "estado": "publicada",
    "reservas_confirmadas_count": 12,
    "plazas_libres": 28,
    "sala": {
      "id": 1,
      "nombre": "Auditorio",
      "ubicacion": "...",
      "capacidad": 120
    },
    "ponentes": [
      { "id": 2, "nombre": "...", "apellidos": "...", "organizacion": "..." }
    ]
  }
]
```

`plazas_libres` = `aforo` − reservas confirmadas. `apertura_plazas` la calcula el servidor: **7 días antes del inicio**.

#### 6 · `GET /charlas/{id}` — Detalle

**Público.** Mismos campos que en la lista.
❌ **404** si no existe o no está publicada.

#### 7 · `POST /charlas` — Crear charla

**Organización.**

Cuerpo:

```json
{
  "titulo": "IA aplicada a la salud",
  "descripcion": "...",
  "sala_id": 1,
  "ponentes": [2, 5],
  "inicio": "2026-11-25 10:00",
  "fin": "2026-11-25 11:00",
  "aforo": 40,
  "estado": "publicada"
}
```

| Campo         | Reglas                                                                   |
| ------------- | ------------------------------------------------------------------------ |
| `titulo`      | obligatorio, máx. 150                                                    |
| `descripcion` | opcional                                                                 |
| `sala_id`     | obligatorio, sala existente                                              |
| `ponentes`    | obligatorio, lista de ids, **al menos 1**, sin repetir, todos existentes |
| `inicio`      | obligatorio, fecha                                                       |
| `fin`         | obligatorio, **posterior a `inicio`**                                    |
| `aforo`       | obligatorio, mín. 1 y **no mayor que la capacidad de la sala**           |
| `estado`      | opcional: `borrador`, `publicada` o `cancelada`                          |

`apertura_plazas` **no se envía**: si llega, se ignora y el servidor la pone 7 días antes del inicio.
La charla y sus ponentes se guardan en una **transacción**: o se guarda todo o nada.

✅ **201** la charla creada con `sala` y `ponentes`.
❌ **422** datos inválidos, p. ej. `El aforo supera la capacidad de la sala: admite como maximo 120 personas.`

#### 8 · `PUT /charlas/{id}` — Editar charla

**Organización.** Mismo cuerpo y reglas que crear. La lista `ponentes` **sustituye** a la anterior.
✅ **200** la charla actualizada.

#### 9 · `DELETE /charlas/{id}` — Cancelar charla

**Organización.** No se borra: pasa a `estado = cancelada` y **todas sus reservas confirmadas se cancelan** en la misma transacción.
✅ **200** `{ "mensaje": "Charla cancelada" }`

---

### Ponentes

#### 10 · `GET /ponentes` — Lista

**Público.** Ordenados por nombre.

#### 11 · `GET /ponentes/{id}` — Detalle

**Público.** Incluye sus `charlas` publicadas, ordenadas por fecha.

#### 12 · `POST /ponentes` y 13 · `PUT /ponentes/{id}`

**Organización.**

| Campo          | Reglas                         |
| -------------- | ------------------------------ |
| `nombre`       | obligatorio, máx. 100          |
| `apellidos`    | opcional, máx. 150             |
| `organizacion` | opcional, máx. 150             |
| `biografia`    | opcional                       |
| `foto_url`     | opcional, URL válida, máx. 255 |

✅ **201** (crear) / **200** (editar).

#### 14 · `DELETE /ponentes/{id}`

**Organización.**
✅ **200** `{ "mensaje": "Ponente eliminado" }`
❌ **409** `No se puede eliminar: el ponente tiene charlas asignadas.`

---

### Salas

#### 15 · `GET /salas` y 16 · `GET /salas/{id}`

**Público.** Lista ordenada por nombre / detalle de una sala.

#### 17 · `GET /salas/{id}/charlas`

**Público.** Charlas publicadas que se celebran en esa sala, con sus ponentes y plazas libres.

#### 18 · `POST /salas` y 19 · `PUT /salas/{id}`

**Organización.**

| Campo       | Reglas                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| `nombre`    | obligatorio, máx. 100, **único**                                                                          |
| `ubicacion` | opcional, máx. 255                                                                                        |
| `capacidad` | obligatorio, entre 1 y 65535. Al editar, **no puede ser menor que el aforo** de sus charlas no canceladas |

#### 20 · `DELETE /salas/{id}`

**Organización.**
❌ **409** `No se puede eliminar: la sala tiene charlas asignadas.`

---

### Reservas

Reglas de negocio (comprobadas en `ReservaController`):

- **Una reserva por persona y charla.** Si se cancela y se vuelve a reservar, se **reactiva la misma reserva** (mismo id y mismo código).
- Las reservas se abren **7 días antes** del inicio y se cierran cuando la charla empieza.
- Se puede **cancelar hasta 24 h antes** del inicio.
- El rol `acceso` no puede reservar.

#### 21 · `GET /mis-reservas`

**Asistente / Organización.** Todas sus reservas, también las canceladas, de la más reciente a la más antigua. Cada una incluye su `charla` (con ponentes, sala y plazas libres) y su `asistencia` si ya consta.

✅ **200**

```json
[
  {
    "id": 15,
    "codigo": "K7Q2M9XA4B",
    "estado": "confirmada",
    "confirmada_en": "2026-11-17T09:12:00",
    "cancelada_en": null,
    "charla": { "id": 3, "titulo": "IA aplicada a la salud", "...": "..." },
    "asistencia": null
  }
]
```

`qr_semilla` está oculto: nunca sale en la respuesta.

#### 22 · `POST /reservas` — Reservar

**Asistente / Organización.**

Cuerpo: `{ "charla_id": 3 }`

Todo ocurre dentro de una **transacción** que **bloquea la fila de la charla** (`lockForUpdate`): si dos personas piden la última plaza a la vez, la segunda espera y recibe "No quedan plazas". Así nunca se supera el aforo.

✅ **201** la reserva con su `codigo` (10 caracteres, único) y su charla.

| Código | Mensaje                                                                        | Cuándo                          |
| ------ | ------------------------------------------------------------------------------ | ------------------------------- |
| ❌ 422 | `Indica la charla que quieres reservar.` / `La charla no existe.`              | Falta `charla_id` o no existe   |
| ❌ 422 | `Esta charla no admite reservas.`                                              | La charla no está publicada     |
| ❌ 422 | `Todavía no se puede reservar: las reservas se abren 7 días antes del inicio.` | Antes de `apertura_plazas`      |
| ❌ 422 | `La charla ya ha empezado: no admite reservas.`                                | Después de `inicio`             |
| ❌ 409 | `Ya tienes plaza en esta charla.`                                              | Ya tiene una reserva confirmada |
| ❌ 409 | `No quedan plazas libres en esta charla.`                                      | Aforo completo                  |
| ❌ 403 | `No tienes permiso para esta accion.`                                          | Rol `acceso`                    |
| ❌ 401 | —                                                                              | Sin sesión                      |

#### 23 · `DELETE /reservas/{id}` — Cancelar reserva

**Asistente / Organización.** La reserva pasa a `cancelada`, se guarda `cancelada_en` y la plaza queda libre.

✅ **200** `{ "mensaje": "Reserva cancelada" }`

| Código | Mensaje                                               | Cuándo                                                       |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------ |
| ❌ 404 | `No se ha encontrado la reserva.`                     | No existe **o es de otra persona** (no se revela que existe) |
| ❌ 409 | `La reserva ya está cancelada.`                       | Ya estaba cancelada                                          |
| ❌ 409 | `Ya consta tu asistencia a esta charla.`              | Ya asistió                                                   |
| ❌ 422 | `Solo se puede cancelar hasta 24 h antes del inicio.` | Faltan menos de 24 h                                         |

---

### Contacto

#### 24 · `POST /contacto` — Formulario de contacto

**Público.** Máximo 5 envíos por minuto. **No guarda nada en la base de datos**: solo envía un correo al buzón de contacto (en desarrollo lo recoge **Mailpit**, en `http://localhost:8025`).

Cuerpo:

```json
{
  "nombre": "Ana",
  "email": "ana@example.com",
  "asunto": "Duda sobre las charlas",
  "mensaje": "Hola, quería saber...",
  "privacidad": true
}
```

| Campo        | Reglas                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------- |
| `nombre`     | obligatorio, máx. 100, sin saltos de línea                                               |
| `email`      | obligatorio, email válido                                                                |
| `asunto`     | obligatorio, máx. 150, sin saltos de línea                                               |
| `mensaje`    | obligatorio, entre 10 y 5000                                                             |
| `privacidad` | obligatorio, aceptado                                                                    |
| `web`        | campo oculto antibots: si llega relleno, se responde "enviado" pero **no se envía nada** |

✅ **200** `{ "mensaje": "Mensaje enviado" }`
❌ **422** datos inválidos · ❌ **503** el correo no se pudo enviar (el detalle se guarda en el log, no se muestra).

---

### Usuarios (gestión por la organización)

Las cuentas se crean con `POST /register` y **no se borran** (tienen reservas asociadas): se desactivan.

#### 25 · `GET /usuarios` — Lista

**Organización.** Ordenados por apellidos y nombre, con su `rol` y `reservas_count`.
Filtro opcional: `?rol=asistente` | `organizacion` | `acceso`.
❌ **422** si el rol del filtro no existe.

#### 26 · `GET /usuarios/{id}` — Detalle

**Organización.** El usuario con su `rol` y `reservas_count`. La contraseña nunca aparece.

#### 27 · `PUT /usuarios/{id}` — Cambiar rol o activar/desactivar

**Organización.**

Cuerpo (al menos uno de los dos):

```json
{ "rol_id": 3, "activo": false }
```

| Campo    | Reglas                                                |
| -------- | ----------------------------------------------------- |
| `rol_id` | obligatorio si no se envía `activo`; rol existente    |
| `activo` | obligatorio si no se envía `rol_id`; `true` o `false` |

Nombre, email y contraseña **no se cambian aquí**: son datos de la propia persona.
Al **desactivar** una cuenta se borran todos sus tokens, así que **sale de todas sus sesiones al momento**.

✅ **200** el usuario actualizado con su `rol`.
❌ **422** `No puedes cambiar tu propio rol ni desactivar tu propia cuenta.` (para que la organización no se quede sin nadie que gestione la web)
❌ **422** `Indica el nuevo rol o si la cuenta está activa.` / `El rol no existe.`

---

### Roles

Son de **solo lectura**: los permisos (`EnsureRol`) y el registro dependen de sus códigos, así que no se crean, editan ni borran desde la API. Los carga `RolSeeder`.

#### 28 · `GET /roles` y 29 · `GET /roles/{id}`

**Organización.** Cada rol con `usuarios_count` (cuántos usuarios lo tienen).

```json
[
  {
    "id": 3,
    "codigo": "acceso",
    "nombre": "Acceso",
    "descripcion": "Valida la asistencia escaneando el QR",
    "usuarios_count": 1
  }
]
```

❌ **405** si se intenta crear, editar o borrar (`POST`, `PUT`, `DELETE`).

---

### Asistencias

Registrar una **asistencia** es distinto de tener una **reserva**: la reserva es la plaza; la asistencia demuestra que la persona fue.

#### 30 · `POST /asistencias` — Registrar asistencia

**Acceso / Organización.** El personal de sala introduce el **código de la reserva** (el mismo que ve el asistente en "Mis reservas").

Cuerpo: `{ "codigo": "K7Q2M9XA4B" }` (se pasa a mayúsculas y se quitan espacios)

Todo ocurre en una **transacción que bloquea la reserva**: si dos personas validan la misma entrada a la vez, solo cuenta una.

✅ **201** la asistencia con su reserva (persona y charla) y quién la registró.

| Código | Mensaje                                                                         | Cuándo                               |
| ------ | ------------------------------------------------------------------------------- | ------------------------------------ |
| ❌ 422 | `Indica el código de la reserva.`                                               | Falta el código                      |
| ❌ 404 | `No se ha encontrado la reserva.`                                               | El código no existe                  |
| ❌ 409 | `La reserva está cancelada.`                                                    | Reserva cancelada                    |
| ❌ 409 | `La asistencia ya está registrada.`                                             | Ya se registró antes (no se duplica) |
| ❌ 422 | `Todavía no se puede registrar la asistencia: se abre 30 min antes del inicio.` | Demasiado pronto                     |
| ❌ 422 | `La charla ya ha terminado.`                                                    | Después de `fin`                     |
| ❌ 403 | `No tienes permiso para esta accion.`                                           | Rol asistente                        |

`qr_ventana` guarda el tramo de 30 s en que se registra (`segundos desde 1970 ÷ 30`). **En febrero** este dato vendrá del **QR temporal** escaneado y el servidor comprobará que no está caducado.

#### 31 · `GET /asistencias` — Quién ha asistido

**Organización.** De la más reciente a la más antigua, con la persona, la charla y quién la registró.
Filtro opcional: `?charla_id=3` (solo las de esa charla).
❌ **403** para asistentes y para el rol acceso (el personal de sala registra, pero no ve el listado).

---

### Notificaciones

Registro de los **correos de confirmación** de cada reserva, para que la organización vea cuáles han fallado. Son de **solo lectura**: las crea el sistema al reservar _(el envío automático se programa en diciembre)_.

#### 32 · `GET /notificaciones` — Lista

**Organización.** De la más reciente a la más antigua, con su reserva.
Filtro opcional: `?estado=pendiente` | `enviada` | `fallida`.
❌ **422** si el estado no es uno de esos tres.

#### 33 · `GET /notificaciones/{id}` — Detalle

**Organización.** Con la reserva, su usuario y su charla.

---

## 6. Pruebas automáticas

Las reglas anteriores están cubiertas por **53 tests** (PHPUnit) en `backend/tests/Feature/` y `backend/tests/Unit/`:

| Archivo                    | Qué comprueba                                                                                                                                                                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ReservaTest.php`          | Reservar y ver la reserva, permisos por rol, sin sesión, reserva repetida, sin plazas, plazo sin abrir, charla empezada o sin publicar, cancelar y volver a reservar, límite de 24 h, reservas ajenas, reserva ya cancelada, asistencia registrada |
| `AperturaReservasTest.php` | Apertura 7 días antes, se recalcula al mover la charla, la API no deja elegirla                                                                                                                                                                    |
| `CharlaPonentesTest.php`   | Charlas con varios ponentes, crear y editar charlas como organización, ponente obligatorio, no borrar ponentes con charlas                                                                                                                         |
| `ContactoTest.php`         | Envío al buzón, datos obligatorios, filtro antibots                                                                                                                                                                                                |
| `UsuarioTest.php`          | Listar y filtrar por rol, ver un usuario, cambiar rol, desactivar cierra las sesiones, no cambiarse a sí mismo, datos obligatorios, solo organización                                                                                              |
| `RolTest.php`              | Ver roles con sus usuarios, no se crean desde la API, solo organización                                                                                                                                                                            |
| `AsistenciaTest.php`       | Registrar con el código, consultar por charla, permisos de asistente y acceso, código inexistente, reserva cancelada, no duplicar, antes de 30 min, charla terminada                                                                               |
| `NotificacionTest.php`     | Ver y filtrar por estado, ver una con su reserva, estado inválido, solo organización                                                                                                                                                               |

Ejecutar con Docker:

```
docker compose exec web php artisan test
```

Resultado el 17/11/2026: **53 passed (162 assertions)** en 22,75 s.

## 7. Pendiente para la entrega final

- Correo de confirmación al reservar (crear la `notificacion`, enviarla y reintentar si falla sin crear otra reserva).
- QR temporal que cambia cada 30 s: generarlo a partir de `qr_semilla` y validarlo en `POST /asistencias` (rechazar caducados, alterados o repetidos).
- Panel de organización en el frontend con reservas, asistencias y notificaciones.
