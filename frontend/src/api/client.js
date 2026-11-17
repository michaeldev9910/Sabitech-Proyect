import { ApiError } from './api-error';

// Ruta relativa: Vite reenvía /api al backend (ver vite.config.js).
const API_URL = import.meta.env.VITE_API_URL ?? '/api';

// Si una petición con token devuelve 401, la sesión ha caducado.
// App.jsx se suscribe aquí para borrar el token y volver al estado de invitado.
let alCaducarSesion = null;

export function avisarAlCaducarSesion(funcion) {
    alCaducarSesion = funcion;
    return () => {
        if (alCaducarSesion === funcion) alCaducarSesion = null;
    };
}

/**
 * Petición a la API. Con `token` añade la cabecera Authorization; con `body`, el Content-Type JSON.
 * El resto de opciones (method, body, headers…) se pasan a fetch tal cual.
 * Si la respuesta no es correcta lanza ApiError con el `message` del servidor (422 trae los errores por campo).
 */
export async function pedir(ruta, { token, ...opciones } = {}) {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers: {
            Accept: 'application/json',
            ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...opciones.headers,
        },
    });
    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        if (respuesta.status === 401 && token) alCaducarSesion?.();

        throw new ApiError(
            respuesta.status,
            datos?.message ?? 'No se pudo completar la petición.',
            datos?.errors,
        );
    }

    return datos;
}

// POST con cuerpo JSON y sin token (formulario de contacto).
export function enviar(ruta, cuerpo) {
    return pedir(ruta, { method: 'POST', body: JSON.stringify(cuerpo) });
}
