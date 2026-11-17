# SABITECH WEB

Aplicación web para **reservar plaza en las charlas de las jornadas SABITECH** y **registrar la asistencia**.
Proyecto intermodular de 2.º DAW · XTART · Curso 2026-2027.

- Consultar el programa de charlas y las plazas libres.
- Registrarse, iniciar sesión, reservar y cancelar.
- Ver "Mis reservas" con el código de cada reserva.
- Organización: gestionar charlas, ponentes, salas y usuarios, y consultar asistencias.
- Personal de acceso: registrar la asistencia con el código de la reserva *(QR temporal en febrero)*.

---

## Tecnologías

| Parte | Tecnología |
|---|---|
| Frontend | React 19 + Vite (JavaScript) |
| Backend (API) | PHP 8.4 + Laravel 13 + Sanctum (tokens) |
| Base de datos | MySQL 8.4 |
| Servidor web | Apache (dentro de Docker) |
| Correo en desarrollo | Mailpit (buzón de pruebas) |
| Entorno | Docker y Docker Compose |

## Arquitectura

```
 Navegador (PC o móvil)
        │  http://localhost:5173
        ▼
 ┌────────────────┐   /api/...   ┌──────────────────────┐        ┌──────────┐
 │ frontend       │ ───────────► │ web                  │ ─────► │ db       │
 │ React + Vite   │   (proxy)    │ Apache + PHP/Laravel │  SQL   │ MySQL    │
 │ puerto 5173    │              │ puerto 8080          │        │ 3306     │
 └────────────────┘              └──────────┬───────────┘        └──────────┘
                                            │ SMTP 1025              ▲
                                            ▼                        │
                                     ┌─────────────┐         ┌──────────────┐
                                     │ mailpit     │         │ phpmyadmin   │
                                     │ puerto 8025 │         │ puerto 8081  │
                                     └─────────────┘         └──────────────┘
```

El navegador solo habla con el **frontend**. Vite reenvía las peticiones `/api` al contenedor **web** (Laravel), que es el único que accede a la base de datos.

---

## Requisitos

- **Docker Desktop** abierto (en Windows, con WSL 2 y contenedores Linux).
- **Git**.
- Puertos libres: `5173`, `8080`, `8081` y `8025`.

No hace falta instalar PHP, Composer, Node ni MySQL en el ordenador: todo va dentro de Docker.

---

## Instalación paso a paso

Ejecuta los comandos **uno a uno** en una terminal (PowerShell o CMD en Windows).

### 1. Descargar el proyecto
```
git clone https://github.com/michaeldev9910/Sabitech-Proyect.git SABITECH
cd SABITECH
```

### 2. Crear los archivos de configuración
Hay dos archivos `.env`, que **no se suben a GitHub** porque llevan contraseñas. Se crean copiando las plantillas:

```
copy .env.example .env
copy backend\.env.example backend\.env
```
*(En Linux o macOS: `cp .env.example .env` y `cp backend/.env.example backend/.env`.)*

Abre los dos archivos y **elige tus contraseñas**:
- En `.env` (raíz): `DB_PASSWORD` y `DB_ROOT_PASSWORD`.
- En `backend/.env`: `DB_PASSWORD` tiene que ser **la misma** que `DB_PASSWORD` del `.env` de la raíz.

### 3. Construir y arrancar los contenedores
```
docker compose up -d --build
```
La primera vez tarda unos minutos, porque descarga las imágenes e instala las dependencias del frontend. Comprueba que todo está en marcha:
```
docker compose ps
```
Tienen que aparecer `web`, `frontend`, `db`, `phpmyadmin` y `mailpit`, y `db` con estado `healthy`.

### 4. Instalar las dependencias de Laravel
```
docker compose exec web composer install
```

### 5. Generar la clave de la aplicación
```
docker compose exec web php artisan key:generate
```

### 6. Crear las tablas y cargar los datos de prueba
```
docker compose exec web php artisan migrate --seed
```

### 7. Abrir la aplicación

| Qué | Dirección |
|---|---|
| **Web (frontend)** | http://localhost:5173 |
| API (backend) | http://localhost:8080/api/charlas |
| Programa en Blade (backend) | http://localhost:8080/programa |
| phpMyAdmin | http://localhost:8081 (usuario `root` y tu `DB_ROOT_PASSWORD`) |
| Mailpit (correos de prueba) | http://localhost:8025 |

---

## Usuarios de prueba

Los crea `php artisan migrate --seed`. Todos tienen la contraseña **`password`**.

| Email | Perfil | Para probar |
|---|---|---|
| `asistente1@sabitech.test` | Asistente | Reservar, ver y cancelar reservas |
| `asistente2@sabitech.test` | Asistente | Reservar la última plaza de una charla |
| `asistente3@sabitech.test` | Asistente | Tiene una reserva cancelada |
| `organizacion@sabitech.test` | Organización | Gestionar charlas, ponentes, salas y usuarios |
| `acceso@sabitech.test` | Acceso | Registrar asistencia con el código de reserva |

⚠️ Son cuentas **solo para pruebas**. En el despliegue final se cambian las contraseñas.

---

## Comandos útiles

| Para… | Comando |
|---|---|
| Arrancar | `docker compose up -d` |
| Parar | `docker compose down` |
| Ver los registros (logs) | `docker compose logs -f web` |
| Ejecutar los tests | `docker compose exec web php artisan test` |
| Borrar los datos y volver a cargar los de prueba | `docker compose exec web php artisan migrate:fresh --seed` |
| Abrir una consola en Laravel | `docker compose exec web bash` |

### Pruebas automáticas
```
docker compose exec web php artisan test
```
Los tests usan una base de datos temporal en memoria (SQLite): **no tocan los datos** de MySQL.

### Entrar desde el móvil
El frontend acepta conexiones de la red local. Con el móvil en la **misma wifi**, abre `http://<IP-del-PC>:5173`. La IP del PC sale con `ipconfig` en Windows.

### Ver los correos
Los correos que envía la aplicación (por ejemplo, el formulario de contacto) **no salen a internet**: los recoge Mailpit. Se ven en http://localhost:8025.

---

## Copia de seguridad de la base de datos

Funciona igual en PowerShell, CMD, Linux y macOS. Cuando pida `Enter password:`, escribe tu `DB_ROOT_PASSWORD` (no se ve al escribir).

**Hacer una copia** (deja `copia.sql` en la carpeta del proyecto):
```
docker compose exec db mysqldump -uroot -p --result-file=/tmp/copia.sql Sabitech
docker compose cp db:/tmp/copia.sql ./copia.sql
```

**Recuperarla:**
```
docker compose cp ./copia.sql db:/tmp/copia.sql
docker compose exec db bash
mysql -uroot -p Sabitech < /tmp/copia.sql
exit
```
Los dos primeros comandos se escriben en tu terminal; `mysql …` y `exit`, dentro del contenedor (después de `docker compose exec db bash`).

`copia.sql` contiene datos personales de los usuarios: **no lo subas a GitHub**.

Los datos de MySQL se guardan en el volumen `mysql_data`, así que **no se pierden** al hacer `docker compose down`. Solo se borran con `docker compose down -v`.

---

## Problemas frecuentes

| Problema | Solución |
|---|---|
| `Access denied for user` al migrar | `DB_PASSWORD` no coincide entre `.env` y `backend/.env`. Si cambiaste la contraseña después del primer arranque, MySQL sigue con la antigua: `docker compose down -v` (**borra los datos**) y repite desde el paso 3 |
| `No application encryption key` | Falta el paso 5 (`php artisan key:generate`) |
| `vendor/autoload.php not found` | Falta el paso 4 (`composer install`) |
| La web carga pero no salen charlas | Comprueba que `web` está en marcha (`docker compose ps`) y que hiciste el paso 6 |
| `port is already allocated` | Otro programa usa ese puerto. Ciérralo o cambia el puerto en `compose.yaml` |
| `db` no pasa a `healthy` | Espera un poco: la primera vez MySQL tarda en crear la base. Mira `docker compose logs db` |

---

## Estructura del proyecto

```
SABITECH/
├── README.md            ← este archivo
├── compose.yaml         ← los 5 servicios de Docker
├── Dockerfile           ← imagen de PHP + Apache para Laravel
├── .env.example         ← plantilla de contraseñas de la base de datos
├── docker/apache/       ← configuración de Apache
├── docs/                ← documentación técnica
├── backend/             ← Laravel (API, base de datos, tests)
│   ├── app/Http/Controllers/
│   ├── database/migrations/ y seeders/
│   ├── routes/api.php
│   └── tests/
└── frontend/            ← React + Vite
    └── src/ (api, componentes, vistas, modelos, utilidades)
```

## Documentación

| Documento | Contenido |
|---|---|
| [Arquitectura](docs/ARQUITECTURA.md) | Servicios, puertos, comunicación, secretos y por qué se eligió así |
| [API](docs/API.md) | Las 33 rutas de la API: permisos, datos, respuestas y errores |
| [Diccionario de datos](docs/DICCIONARIO_DATOS.md) | Tablas, campos, restricciones e integridad |
| [Plan del QR](docs/PLAN_QR.md) | Diseño del QR que cambia cada 30 s |
| [Plan del correo](docs/PLAN_CORREO.md) | Diseño del correo de confirmación de reserva |
| [Plan de publicación](docs/PLAN_PUBLICACION.md) | Entorno de demostración: servidor, dominio, HTTPS, CI y copias |

## Ramas y versiones

- `main`: versión estable. Es la que se entrega.
- `frontend` y `backend`: desarrollo. Se integran en `main` con pull requests.
- Etiqueta **`v0.1-checkpoint`**: versión presentada en el checkpoint de noviembre de 2026.

## Equipo

Michael Leguizamon · Héctor Molina · Karim Gómez
