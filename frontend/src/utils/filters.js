// =================================
// Filtros del programa, sincronizados con la URL
// (así un enlace como ?area=salud&q=ia se puede compartir)
// =================================

export const FILTROS_INICIALES = {
  q: "",
  area: "todas",
  momento: "proximas",
  sala: "todas",
  orden: "fecha",
};

const VALIDOS = {
  area: ["todas", "salud", "tecnologia", "negocios"],
  momento: ["proximas", "celebradas", "todas"],
  orden: ["fecha", "recientes", "plazas", "az"],
};

export function leerFiltrosDeUrl() {
  const parametros = new URLSearchParams(window.location.search);
  const filtros = { ...FILTROS_INICIALES };

  for (const campo of Object.keys(FILTROS_INICIALES)) {
    const valor = parametros.get(campo);
    if (valor === null) continue;
    if (VALIDOS[campo] && !VALIDOS[campo].includes(valor)) continue;
    filtros[campo] = valor;
  }

  return filtros;
}

export function escribirFiltrosEnUrl(filtros) {
  const parametros = new URLSearchParams();

  for (const [campo, valor] of Object.entries(filtros)) {
    if (valor !== FILTROS_INICIALES[campo]) parametros.set(campo, valor);
  }

  const consulta = parametros.toString();
  const url = `${window.location.pathname}${consulta ? `?${consulta}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", url);
}
