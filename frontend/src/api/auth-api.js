import { Usuario } from "../models/user.js";
import { pedir } from "./client.js";

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
