import { useDeferredValue, useEffect, useMemo, useRef } from "react";
import IconoArea from "../IconoArea/IconoArea.jsx";
import TarjetaCharla from "./TarjetaCharla.jsx";
import { CATEGORIAS } from "../../utils/categorias.js";
import { momentoDe, nombreCompleto } from "../../utils/charlas.js";
import { FILTROS_INICIALES } from "../../utils/filtros.js";
import "./Programa.css";

const MOMENTOS = [
  { id: "proximas", texto: "Próximas" },
  { id: "celebradas", texto: "Celebradas" },
  { id: "todas", texto: "Todas" },
];

const ORDENES = [
  { id: "fecha", texto: "Fecha: más cercanas" },
  { id: "recientes", texto: "Fecha: más lejanas" },
  { id: "plazas", texto: "Más plazas libres" },
  { id: "az", texto: "Título (A-Z)" },
];

const normalizar = (texto) =>
  (texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const textoBuscable = (charla) =>
  normalizar(
    [
      charla.titulo,
      charla.descripcion,
      nombreCompleto(charla.ponente),
      charla.ponente?.organizacion,
      charla.ponente?.biografia,
      charla.sala?.nombre,
    ].join(" "),
  );

const encajaMomento = (charla, momento) => {
  if (momento === "todas") return true;
  const actual = momentoDe(charla);
  return momento === "celebradas" ? actual === "celebrada" : actual !== "celebrada";
};

const COMPARADORES = {
  fecha: (a, b) => new Date(a.inicio) - new Date(b.inicio),
  recientes: (a, b) => new Date(b.inicio) - new Date(a.inicio),
  plazas: (a, b) => (b.plazasLibres ?? b.aforo) - (a.plazasLibres ?? a.aforo),
  az: (a, b) => a.titulo.localeCompare(b.titulo, "es"),
};

function Programa({ charlas, areaDe, salas, filtros, setFiltros, cargando, hayError }) {
  const buscadorRef = useRef(null);
  const busqueda = useDeferredValue(filtros.q);

  const cambiar = (campo, valor) =>
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }));

  // Atajo de teclado "/" para ir al buscador (como en las grandes webs)
  useEffect(() => {
    const alTeclear = (evento) => {
      if (evento.key !== "/" || evento.ctrlKey || evento.metaKey || evento.altKey) return;
      const objetivo = evento.target;
      const escribiendo =
        objetivo instanceof HTMLElement &&
        (objetivo.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(objetivo.tagName));
      if (escribiendo) return;
      evento.preventDefault();
      buscadorRef.current?.scrollIntoView({ block: "center" });
      buscadorRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, []);

  // Índice de búsqueda: se calcula una vez por lista de charlas
  const indice = useMemo(
    () => new Map((charlas ?? []).map((charla) => [charla.id, textoBuscable(charla)])),
    [charlas],
  );

  // Filtros "base" (todo menos el área): sirven para contar por área
  const base = useMemo(() => {
    const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean);
    return (charlas ?? []).filter((charla) => {
      if (!encajaMomento(charla, filtros.momento)) return false;
      if (filtros.sala !== "todas" && String(charla.salaId) !== filtros.sala) return false;
      const texto = indice.get(charla.id);
      return palabras.every((palabra) => texto.includes(palabra));
    });
  }, [charlas, indice, busqueda, filtros.momento, filtros.sala]);

  const resultados = useMemo(
    () =>
      base
        .filter((charla) => filtros.area === "todas" || areaDe.get(charla.id) === filtros.area)
        .sort(COMPARADORES[filtros.orden] ?? COMPARADORES.fecha),
    [base, areaDe, filtros.area, filtros.orden],
  );

  const cuentaArea = (id) =>
    id === "todas" ? base.length : base.filter((charla) => areaDe.get(charla.id) === id).length;

  const hayFiltros =
    filtros.q !== FILTROS_INICIALES.q ||
    filtros.area !== FILTROS_INICIALES.area ||
    filtros.momento !== FILTROS_INICIALES.momento ||
    filtros.sala !== FILTROS_INICIALES.sala;

  const limpiar = () => setFiltros(FILTROS_INICIALES);

  return (
    <section id="charlas" className="Programa" aria-labelledby="programa-titulo">
      <div className="Programa__contenedor">
        <header className="Programa__cabecera">
          <p className="Programa__antetitulo">Programa</p>
          <h2 id="programa-titulo" className="Programa__titulo">
            Encuentra tu próxima charla
          </h2>
          <p className="Programa__intro">
            Filtra por área, momento o sala y busca por tema, ponente u
            organización. Pasa el cursor sobre un ponente para ver su charla.
          </p>
        </header>

        {/* BARRA DE FILTROS */}
        <div className="Filtros" role="search" aria-label="Filtrar charlas">
          <div className="Filtros__fila">
            <label className="Buscador">
              <span className="sr-only">Buscar charlas</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={buscadorRef}
                id="buscar-charlas"
                type="search"
                placeholder="Tema, ponente u organización"
                autoComplete="off"
                value={filtros.q}
                onChange={(evento) => cambiar("q", evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key === "Escape" && filtros.q) {
                    evento.stopPropagation();
                    cambiar("q", "");
                  }
                }}
              />
              {filtros.q ? (
                <button
                  type="button"
                  className="Buscador__limpiar"
                  aria-label="Borrar búsqueda"
                  onClick={() => {
                    cambiar("q", "");
                    buscadorRef.current?.focus();
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <kbd aria-hidden="true">/</kbd>
              )}
            </label>

            <div className="Segmentado" role="group" aria-label="Momento">
              {MOMENTOS.map(({ id, texto }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={filtros.momento === id}
                  onClick={() => cambiar("momento", id)}
                >
                  {texto}
                </button>
              ))}
            </div>

            <label className="Selector">
              <span className="Selector__etiqueta">Sala</span>
              <select value={filtros.sala} onChange={(evento) => cambiar("sala", evento.target.value)}>
                <option value="todas">Todas</option>
                {salas.map((sala) => (
                  <option key={sala.id} value={String(sala.id)}>
                    {sala.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="Selector">
              <span className="Selector__etiqueta">Ordenar</span>
              <select value={filtros.orden} onChange={(evento) => cambiar("orden", evento.target.value)}>
                {ORDENES.map(({ id, texto }) => (
                  <option key={id} value={id}>
                    {texto}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="Filtros__fila Filtros__fila--areas">
            <div className="Chips" role="group" aria-label="Área">
              <button
                type="button"
                className="Chip"
                aria-pressed={filtros.area === "todas"}
                onClick={() => cambiar("area", "todas")}
              >
                Todas las áreas
                <span className="Chip__cuenta">{cuentaArea("todas")}</span>
              </button>
              {CATEGORIAS.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  className="Chip"
                  data-area={categoria.id}
                  aria-pressed={filtros.area === categoria.id}
                  onClick={() => cambiar("area", categoria.id)}
                >
                  <IconoArea area={categoria.id} className="Chip__icono" />
                  {categoria.nombre}
                  <span className="Chip__cuenta">{cuentaArea(categoria.id)}</span>
                </button>
              ))}
            </div>

            <div className="Filtros__resumen">
              <p aria-live="polite">
                {cargando
                  ? "Cargando charlas…"
                  : `${resultados.length} ${resultados.length === 1 ? "charla" : "charlas"}`}
              </p>
              {hayFiltros && (
                <button type="button" className="Filtros__limpiar" onClick={limpiar}>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RESULTADOS */}
        {hayError && (
          <p className="Programa__aviso Programa__aviso--error" role="alert">
            No se han podido cargar las charlas. Comprueba tu conexión y recarga
            la página para volver a intentarlo.
          </p>
        )}

        {cargando && (
          <ul className="Rejilla" aria-hidden="true">
            {Array.from({ length: 4 }, (_, indice) => (
              <li key={indice} className="Tarjeta Tarjeta--esqueleto" />
            ))}
          </ul>
        )}

        {!cargando && !hayError && resultados.length === 0 && (
          <div className="Programa__vacio">
            <p className="Programa__vacio-titulo">No hay charlas que coincidan</p>
            <p>
              {charlas?.length
                ? "Prueba con otra búsqueda o quita alguno de los filtros."
                : "Todavía no hay charlas publicadas. Vuelve pronto."}
            </p>
            {hayFiltros && (
              <button type="button" className="Programa__boton" onClick={limpiar}>
                Ver todas las charlas
              </button>
            )}
          </div>
        )}

        {!cargando && resultados.length > 0 && (
          <ul className="Rejilla">
            {resultados.map((charla) => (
              <li key={charla.id}>
                <TarjetaCharla charla={charla} area={areaDe.get(charla.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Programa;
