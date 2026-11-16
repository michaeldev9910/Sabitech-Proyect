// =================================
// Reservas: qué se puede hacer y por qué no.
// El servidor vuelve a comprobarlo todo; esto solo evita enseñar
// botones que van a fallar.
// =================================

import { HORAS_LIMITE_CANCELAR, ROLES_QUE_RESERVAN } from "./rules.js";
import { estadoPlazas, momentoDe } from "./talks.js";

const UNA_HORA = 60 * 60 * 1000;

/** El rol `acceso` no reserva: solo valida la entrada. */
export const tieneRolQueReserva = (usuario) =>
  ROLES_QUE_RESERVAN.includes(usuario?.rol?.codigo);

/** Reserva confirmada de la persona en esa charla, o null. */
export const reservaConfirmadaDe = (charla, misReservas) =>
  (misReservas ?? []).find(
    (reserva) => reserva.charlaId === charla.id && reserva.estado === "confirmada",
  ) ?? null;

/** Charla publicada, con el plazo abierto (apertura ≤ ahora < inicio) y con plazas. */
export function reservasAbiertas(charla, ahora = Date.now()) {
  if (charla.estado !== "publicada") return false;
  if (momentoDe(charla, ahora) !== "proxima") return false;
  return ["abierta", "ultimas"].includes(estadoPlazas(charla, ahora).tono);
}

export function puedeReservar(usuario, charla, misReservas, ahora = Date.now()) {
  return (
    tieneRolQueReserva(usuario) &&
    reservasAbiertas(charla, ahora) &&
    !reservaConfirmadaDe(charla, misReservas)
  );
}

/** Por qué no se puede cancelar una reserva, o null si se puede. */
export function motivoNoCancelable(reserva, ahora = Date.now()) {
  if (reserva.estado !== "confirmada") return "La reserva ya está cancelada";
  if (reserva.asistida) return "Ya consta tu asistencia";

  const inicio = new Date(reserva.charla?.inicio).getTime();
  if (inicio - ahora <= HORAS_LIMITE_CANCELAR * UNA_HORA) {
    return `Solo se puede cancelar hasta ${HORAS_LIMITE_CANCELAR} h antes`;
  }

  return null;
}

export const puedeCancelar = (reserva, ahora = Date.now()) =>
  motivoNoCancelable(reserva, ahora) === null;
