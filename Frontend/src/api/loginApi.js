import { Usuario } from "../models/Usuario.js";
import { ApiError } from "./apiError.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

async function pedir(ruta, { token, ...opciones } = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      Accept: "application/json",
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...opciones.headers,
    },
  });
  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new ApiError(
      respuesta.status,
      datos?.message ?? "No se pudo completar la petición.",
      datos?.errors,
    );
  }

  return datos;
}

async function autenticar(ruta, datos) {
  const respuesta = await pedir(ruta, {
    method: "POST",
    body: JSON.stringify(datos),
  });

  if (!respuesta?.token || !respuesta?.usuario) {
    throw new Error("La respuesta de autenticación no contiene usuario y token.");
  }

  return {
    token: respuesta.token,
    usuario: Usuario.fromJSON(respuesta.usuario),
  };
}

export function iniciarSesion(datos) {
  return autenticar("/login", datos);
}

export function registrarUsuario(datos) {
  return autenticar("/register", datos);
}

export async function obtenerUsuario(token) {
  const respuesta = await pedir("/me", { token });
  return Usuario.fromJSON(respuesta);
}

export function cerrarSesion(token) {
  return pedir("/logout", { method: "POST", token });
}
