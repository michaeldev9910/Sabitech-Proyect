# Sabitech

Web para consultar y gestionar las charlas de **Sabitech**, un ciclo de ponencias sobre **Salud, Tecnología y Negocios**. Los asistentes ven el programa, filtran las charlas y (próximamente) reservan su plaza y entran a la sala con un código QR. La organización gestiona charlas, ponentes y salas.

El proyecto tiene dos partes:

- **Backend**: API REST en Laravel con base de datos MySQL, en Docker.
- **Frontend**: aplicación React + Vite que consume esa API.

## Estado del proyecto

**Hecho**

- Registro, inicio y cierre de sesión con tokens (Laravel Sanctum). Quien se registra es siempre *asistente*; los demás roles se asignan desde la base de datos.
- Consulta pública de charlas, ponentes y salas.
- Alta, edición y baja de charlas, ponentes y salas, solo para el rol *organización*.
- Modelo completo de base de datos y datos de prueba (seeders).
- Web: pantalla de acceso (login, registro o entrar como invitado), portada, carrusel de charlas recientes, programa con filtros, sedes agrupadas por planta y sección de contacto.

**Pendiente**

- Reservas y control de asistencia: las tablas y modelos existen, pero los controladores están vacíos y no tienen rutas.
- Código QR de acceso y envío de notificaciones por correo (solo existen en la base de datos).
- La API no guarda la categoría de cada charla; mientras tanto el frontend la deduce del texto ([Frontend/src/utils/categorias.js](Frontend/src/utils/categorias.js)).
- El correo de la sección de contacto es provisional.

## Tecnologías

| Parte | Tecnologías |
| --- | --- |
| Backend | PHP 8.4, Laravel 13, Laravel Sanctum, Apache |
| Base de datos | MySQL 8.4, phpMyAdmin |
| Frontend | React 19, Vite 8, Bootstrap 5.3, Sass |
| Entorno | Docker Compose |

## Estructura del repositorio

```
SABITECH/
├── Backend/            API en Laravel
│   ├── app/            Controladores, modelos y middleware de roles
│   ├── database/       Migraciones y seeders
│   └── routes/api.php  Rutas de la API
├── Frontend/           Web en React + Vite
│   ├── src/api/        Llamadas a la API
│   ├── src/components/ Header, portada, carrusel, programa, sedes, contacto, footer
│   ├── src/Views/      Pantalla de acceso y página principal
│   ├── src/utils/      Filtros, categorías y utilidades
│   └── ESTUDIO_DISENO.txt  Estudio de diseño del rediseño web
├── docker/             Configuración de Apache
├── Dockerfile          Imagen PHP + Apache del backend
└── compose.yaml        Backend, MySQL y phpMyAdmin
```

## Puesta en marcha

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker con Compose)
- [Node.js](https://nodejs.org/) 20.19 o superior (o 22.12+)

### 1. Backend y base de datos

Desde la raíz del repositorio:

```bash
cp Backend/.env.example Backend/.env
docker compose up -d --build
docker compose exec web composer install
docker compose exec web php artisan key:generate
docker compose exec web php artisan migrate --seed
```

Los datos de conexión de `Backend/.env.example` ya coinciden con los de `compose.yaml`.

| Servicio | Dirección |
| --- | --- |
| API | http://localhost:8080/api |
| phpMyAdmin | http://localhost:8081 |

Para volver a crear la base de datos desde cero con los datos de prueba:

```bash
docker compose exec web php artisan migrate:fresh --seed
```

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

La web queda en http://localhost:5173. Por defecto llama a la API en `http://localhost:8080/api`; para usar otra dirección, crea `Frontend/.env.local` con:

```
VITE_API_URL=http://otra-direccion/api
```

Otros comandos: `npm run build` (versión de producción en `dist/`) y `npm run lint`.

### Cuentas de prueba

Las crea `php artisan migrate --seed`. Todas usan la contraseña `password`.

| Rol | Email |
| --- | --- |
| Organización | organizacion@sabitech.test |
| Acceso | acceso@sabitech.test |
| Asistente | asistente1@sabitech.test, asistente2@sabitech.test, asistente3@sabitech.test |

## Roles

| Rol | Qué puede hacer |
| --- | --- |
| `asistente` | Consultar charlas y gestionar sus reservas |
| `organizacion` | Gestionar charlas, ponentes y salas, y consultar inscripciones |
| `acceso` | Validar la asistencia escaneando el QR |

## API

Todas las rutas empiezan por `/api`. Las que requieren sesión usan la cabecera `Authorization: Bearer <token>`, con el token que devuelven `/register` y `/login`.

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/register` | Público |
| POST | `/login` | Público (máximo 5 intentos por minuto) |
| GET | `/charlas`, `/charlas/{id}` | Público |
| GET | `/ponentes`, `/ponentes/{id}` | Público |
| GET | `/salas`, `/salas/{id}` | Público |
| POST | `/logout` | Sesión iniciada |
| GET | `/me` | Sesión iniciada |
| POST, PUT, DELETE | `/charlas`, `/ponentes`, `/salas` | Rol `organizacion` |

## Base de datos

| Tabla | Contenido |
| --- | --- |
| `roles` | Asistente, organización y acceso |
| `usuarios` | Cuentas, cada una con un rol; se pueden desactivar |
| `ponentes` | Nombre, organización, biografía y foto |
| `salas` | Nombre, ubicación y capacidad |
| `charlas` | Ponente, sala, horario, apertura de plazas, aforo y estado (borrador, publicada o cancelada) |
| `reservas` | Plaza de un usuario en una charla, con su código y la semilla del QR |
| `asistencias` | Entrada registrada al escanear el QR de una reserva |
| `notificaciones` | Correos asociados a una reserva y su estado de envío |

## Equipo

- Michael Leguizamon ([michaeldev9910](https://github.com/michaeldev9910))
- Karim Gomez ([karimgomezzeroual-cmd](https://github.com/karimgomezzeroual-cmd))
- Héctor Molina Munera ([HectorMM-428](https://github.com/HectorMM-428))
