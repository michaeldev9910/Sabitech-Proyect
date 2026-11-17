# Plan de publicación de SABITECH WEB

Cómo pasaremos del entorno de **desarrollo** (Docker en nuestros PC) al **entorno de demostración** que se usará en la defensa de febrero.
Estado: **plan para el checkpoint** (17/11/2026). Se ejecuta en la **semana 13 (1-7 de febrero)**.

---

## 1. Qué se pide (enunciado, apartado 4.6)

- Un **entorno de desarrollo** y un **entorno de demostración** claramente identificados.
- La aplicación **publicada** y accesible **desde otro equipo**, con **HTTPS** (necesario para la cámara del QR y la sesión).
- Comprobar la **resolución del nombre** (dominio) que se use.
- Separar la **configuración pública** de los **valores sensibles**.
- Una **comprobación automatizada** (integración continua) que detecte errores de construcción o tests fallidos antes de publicar.
- **Copia de los datos** y forma de **recuperarlos**.
- La versión de la defensa debe **coincidir** con la identificada en la entrega.

## 2. Los dos entornos

| | **Desarrollo** (ahora) | **Demostración** (febrero) |
|---|---|---|
| Dónde | El PC de cada uno, con Docker | Un servidor accesible desde internet |
| Dirección | `http://localhost:5173` | `https://<dominio>` |
| HTTPS | No | **Sí**, certificado gratuito de Let's Encrypt |
| Frontend | Servidor de desarrollo de Vite (recarga al guardar) | **Archivos ya compilados** con `npm run build` |
| Laravel | `APP_ENV=local`, `APP_DEBUG=true` | `APP_ENV=production`, **`APP_DEBUG=false`** |
| Correo | Mailpit (no sale a internet) | **Resend** (envío real a buzones de laboratorio) |
| phpMyAdmin y Mailpit | Accesibles en este PC | **No se publican** |
| Datos | De prueba, se pueden borrar | De prueba, con **copia diaria** |
| Contraseñas | Las de cada uno, en `.env` | **Nuevas y fuertes**, solo en el servidor |

## 3. Dónde publicar

### Opción recomendada: servidor virtual (VPS) con Docker

Alquilar un **VPS pequeño** (1-2 GB de RAM; hay planes de pocos euros al mes y créditos gratuitos para estudiantes) con Linux y Docker.

**Por qué:**
- Usamos **los mismos contenedores** que en desarrollo: lo que funciona en el PC funciona en el servidor.
- Tenemos **control total**: HTTPS, puertos y copias.
- Se puede enseñar en la defensa **desde cualquier dispositivo** (el móvil del profesor incluido), sin depender de la red del centro.
- Es lo más parecido a un despliegue profesional real, que es lo que evalúa el módulo.

### Alternativa: servidor del centro o un PC en la red del aula

Si el centro ofrece un servidor o no queremos pagar:
- Se usa el mismo `compose.yaml` en un PC del aula.
- HTTPS con un certificado propio creado con **mkcert**, instalado en los dispositivos de la demo.
- Nombre resuelto en la red local (por ejemplo, `sabitech.local` en el archivo `hosts` o en el DNS del aula).
- **Limitación:** solo funciona dentro de la red del centro.

> **Decisión pendiente del equipo:** confirmar con el profesor de Despliegue qué medios ofrece el centro antes de alquilar nada.

## 4. Dominio y resolución de nombres

| Opción | Ejemplo | Coste |
|---|---|---|
| Subdominio gratuito (DuckDNS u otro similar) | `sabitech-web.duckdns.org` | Gratis |
| Dominio propio | `sabitech-web.es` | Unos euros al año |

Se crea un **registro DNS de tipo A** que apunte a la IP pública del servidor.

**Comprobación** (evidencia para la memoria):
```
nslookup sabitech-web.duckdns.org
```
Tiene que devolver la IP del servidor. Después se prueba a abrir la web **desde el móvil con datos móviles**, es decir, desde fuera de la red del servidor.

## 5. Cómo quedará el servidor

```
Internet
   │  https://<dominio>  (puerto 443)
   ▼
┌──────────────────────────────────────────────┐
│ Caddy (proxy inverso + HTTPS automático)     │
│   /         → archivos del frontend (build)  │
│   /api/*    → web (Laravel)                  │
└──────────────┬───────────────────────────────┘
               ▼
        web (Apache + Laravel) ──► db (MySQL)    ──► volumen + copias
               │
               └──► Resend (correo real, por internet)
```

- **Caddy** es un servidor web que **consigue y renueva solo** el certificado HTTPS de Let's Encrypt. Sustituye al servidor de desarrollo de Vite.
- El frontend y la API van en el **mismo dominio** (`/` y `/api`), así que no hay problemas de CORS y el token no viaja a otro sitio.
- Solo se abren los puertos **80** (que redirige a HTTPS) y **443**. MySQL, phpMyAdmin y Mailpit **no son accesibles** desde internet.

Se añadirá un `compose.prod.yaml` con estas diferencias respecto al de desarrollo:

| Cambio | Motivo |
|---|---|
| Servicio `caddy` con los puertos 80 y 443 | HTTPS y entrada única |
| `frontend` se compila (`npm run build`) y lo sirve Caddy | Más rápido y seguro que el servidor de desarrollo |
| Sin `phpmyadmin` ni `mailpit` | No hacen falta y serían una puerta abierta |
| `web` sin puerto publicado | Solo se llega a través de Caddy |
| `restart: unless-stopped` en todos | Si el servidor se reinicia, la web vuelve sola |

## 6. Pasos de la publicación

1. **Preparar el servidor:** instalar Docker, crear un usuario sin privilegios de root y activar el cortafuegos (solo puertos 22, 80 y 443).
2. **Dominio:** crear el registro A y comprobarlo con `nslookup`.
3. **Descargar la versión etiquetada:**
   ```
   git clone https://github.com/michaeldev9910/Sabitech-Proyect.git
   cd Sabitech-Proyect
   git checkout v1.0-final
   ```
4. **Configuración de producción** (solo en el servidor, nunca en GitHub):
   - `.env`: contraseñas nuevas y largas para MySQL.
   - `backend/.env`: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://<dominio>`, `MAIL_MAILER=resend` y `RESEND_API_KEY`.
5. **Arrancar:**
   ```
   docker compose -f compose.prod.yaml up -d --build
   docker compose -f compose.prod.yaml exec web composer install --no-dev --optimize-autoloader
   docker compose -f compose.prod.yaml exec web php artisan key:generate
   docker compose -f compose.prod.yaml exec web php artisan migrate --seed --force
   docker compose -f compose.prod.yaml exec web php artisan config:cache
   ```
6. **Comprobar** (lista de la sección 9).
7. **Cambiar las contraseñas** de los usuarios de prueba antes de la defensa.

## 7. Integración continua (GitHub Actions)

Cada vez que se sube algo a `main` o se abre un pull request, GitHub ejecuta automáticamente:

| Comprobación | Comando | Qué detecta |
|---|---|---|
| Tests del backend | `php artisan test` | Reglas rotas (aforo, permisos, reservas…) |
| Construcción del frontend | `npm ci` y `npm run build` | Errores de compilación de React |
| Revisión del código del frontend | `npm run lint` | Errores y malas prácticas en JavaScript |

Si algo falla, GitHub marca el commit en **rojo ❌** y **no se publica esa versión**. El archivo será `.github/workflows/ci.yml`.

> Se puede crear **antes del checkpoint**: es un archivo corto y los 53 tests ya existen.

## 8. Copias de seguridad

- **Copia diaria automática** de la base de datos con `mysqldump`, programada con `cron` en el servidor. Se guardan las **7 últimas**.
- Comando de copia y recuperación: el mismo del [README](../README.md#copia-de-seguridad-de-la-base-de-datos).
- **Prueba de recuperación** antes de la defensa: borrar la base, recuperar la copia y comprobar que las reservas siguen ahí. Es una evidencia que pide el enunciado.
- Las copias **no se suben a GitHub**: contienen datos personales.

## 9. Lista de comprobación antes de la defensa

| Comprobación | Cómo |
|---|---|
| El dominio resuelve a la IP del servidor | `nslookup <dominio>` |
| HTTPS con candado y sin avisos | Abrir la web en el navegador |
| `http://` redirige a `https://` | Abrir con `http://` |
| Funciona desde otro dispositivo y otra red | Móvil con datos móviles |
| Login, reserva, Mis reservas y cancelación | Recorrido de la demo |
| El correo de confirmación llega | Buzón de laboratorio |
| La cámara abre el lector de QR | Móvil del personal de acceso (necesita HTTPS) |
| MySQL no es accesible desde fuera | Intentar conectar al puerto 3306 desde fuera: debe fallar |
| Los errores no muestran detalles técnicos | `APP_DEBUG=false`: provocar un error y ver que sale un mensaje genérico |
| La CI está en verde para esa versión | Pestaña **Actions** de GitHub |
| Copia hecha y recuperación probada | Sección 8 |
| La versión publicada es la etiquetada | `git describe --tags` en el servidor = `v1.0-final` |

## 10. Riesgos y plan B

| Riesgo | Plan B |
|---|---|
| El servidor o internet fallan el día de la defensa | Llevar la demo arrancada en un portátil con el entorno de desarrollo (README) y los mismos datos |
| El certificado HTTPS no se emite | Comprobar que el registro DNS apunta bien y que el puerto 80 está abierto; como último recurso, mkcert en local |
| El servicio de correo falla | La reserva se guarda igual (ver [PLAN_CORREO](PLAN_CORREO.md)); enseñar el reenvío |
| Coste del VPS | Usar créditos de estudiante o la alternativa del centro |

## 11. Calendario

| Cuándo | Qué |
|---|---|
| Noviembre (checkpoint) | Este plan · *opcional:* CI con GitHub Actions |
| Diciembre | Decidir VPS o servidor del centro, y el dominio |
| Semana 13 (1-7 feb) | Publicar, HTTPS, comprobar DNS, copia y recuperación |
| Semana 14 (8-14 feb) | Batería de pruebas completa sobre la versión publicada |
| Semana 15 (15-21 feb) | Etiqueta `v1.0-final` y ensayo de la defensa sobre ella |
