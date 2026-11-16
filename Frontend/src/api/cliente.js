import { ApiError } from './apiError';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export async function pedir(ruta) {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        headers: { Accept: 'application/json' },
    });
    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        throw new ApiError(respuesta.status, datos?.message ?? 'Error en la petición', datos?.errors);
    }

    return datos;
}

// POST con cuerpo JSON. Lanza ApiError igual que pedir() (422 trae los errores por campo).
export async function enviar(ruta, cuerpo) {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
    });
    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        throw new ApiError(respuesta.status, datos?.message ?? 'Error en la petición', datos?.errors);
    }

    return datos;
}
