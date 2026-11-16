// =================================
// Utilidades de presentación para las charlas
// =================================

// Las fechas se muestran en UTC, igual que las guarda la API.
const ZONA = "UTC";

export const formatoFechaLarga = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: ZONA,
});

export const formatoFechaCorta = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  timeZone: ZONA,
});

export const formatoHora = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ZONA,
});

export const formatoDia = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  timeZone: ZONA,
});

export const formatoMes = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  timeZone: ZONA,
});

export const horario = (charla) =>
  `${formatoHora.format(new Date(charla.inicio))} – ${formatoHora.format(new Date(charla.fin))}`;

export const nombreCompleto = (ponente) =>
  ponente ? `${ponente.nombre} ${ponente.apellidos ?? ""}`.trim() : "Ponente por confirmar";

export const iniciales = (ponente) =>
  ponente
    ? `${ponente.nombre?.[0] ?? ""}${ponente.apellidos?.[0] ?? ""}`.toUpperCase()
    : "?";

/** Momento de la charla respecto a ahora: "en-curso" | "proxima" | "celebrada". */
export function momentoDe(charla, ahora = Date.now()) {
  const inicio = new Date(charla.inicio).getTime();
  const fin = new Date(charla.fin).getTime();
  if (ahora >= fin) return "celebrada";
  if (ahora >= inicio) return "en-curso";
  return "proxima";
}

export const ETIQUETA_MOMENTO = {
  "en-curso": "En directo",
  proxima: "Próximamente",
  celebrada: "Celebrada",
};

/**
 * Estado de las plazas para mostrar al usuario.
 * tono: "abierta" | "ultimas" | "completa" | "pendiente" | "cerrada"
 */
export function estadoPlazas(charla, ahora = Date.now()) {
  const momento = momentoDe(charla, ahora);

  if (momento === "celebrada") {
    return { tono: "cerrada", texto: "Charla finalizada" };
  }

  const apertura = new Date(charla.aperturaPlazas).getTime();
  if (ahora < apertura) {
    return {
      tono: "pendiente",
      texto: `Reservas desde el ${formatoFechaCorta.format(new Date(charla.aperturaPlazas))}`,
    };
  }

  const libres = charla.plazasLibres;
  if (libres === null || libres === undefined) {
    return { tono: "abierta", texto: `Aforo de ${charla.aforo} plazas` };
  }
  if (libres <= 0) {
    return { tono: "completa", texto: "Aforo completo" };
  }

  const pocas = libres <= Math.max(5, Math.ceil(charla.aforo * 0.15));
  return {
    tono: pocas ? "ultimas" : "abierta",
    texto: pocas
      ? `Últimas ${libres} ${libres === 1 ? "plaza" : "plazas"}`
      : `${libres} plazas libres`,
  };
}

/**
 * Charlas "recientes" para el carrusel: las más cercanas a hoy
 * (en curso, recién celebradas o a punto de empezar), en orden cronológico.
 */
export function charlasRecientes(charlas, cuantas = 5, ahora = Date.now()) {
  return [...charlas]
    .sort(
      (a, b) =>
        Math.abs(new Date(a.inicio).getTime() - ahora) -
        Math.abs(new Date(b.inicio).getTime() - ahora),
    )
    .slice(0, cuantas)
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
}

/** Próxima charla (o la que está en directo ahora mismo). */
export function siguienteCharla(charlas, ahora = Date.now()) {
  return (
    [...charlas]
      .filter((charla) => momentoDe(charla, ahora) !== "celebrada")
      .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))[0] ?? null
  );
}
