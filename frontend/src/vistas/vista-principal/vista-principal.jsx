import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../../componentes/cabecera/cabecera.jsx";
import Hero from "../../componentes/portada/portada.jsx";
import Recientes from "../../componentes/charlas-recientes/charlas-recientes.jsx";
import Programa from "../../componentes/programa/programa.jsx";
import Sedes from "../../componentes/sedes/sedes.jsx";
import Contacto from "../../componentes/contacto/contacto.jsx";
import Footer from "../../componentes/pie/pie.jsx";
import { listarCharlas } from "../../api/api-charlas.js";
import { listarSalas } from "../../api/api-salas.js";
import { listarMisReservas, reservar } from "../../api/api-reservas.js";
import { tieneRolQueReserva } from "../../utilidades/reservas.js";
import { categoriaDe } from "../../utilidades/categorias.js";
import { charlasRecientes } from "../../utilidades/charlas.js";
import {
  FILTROS_INICIALES,
  escribirFiltrosEnUrl,
  leerFiltrosDeUrl,
} from "../../utilidades/filtros.js";
import "./main-view.css";

/**
 * Página principal de Sabitech (invitado o con sesión iniciada).
 * La sesión la gestiona App.jsx; aquí solo se muestra en el header.
 */
function MainView({
  usuario = null,
  token = null,
  onCerrarSesion,
  onMostrarAcceso,
  onVerMisReservas,
  errorInicial = "",
}) {
  const [charlas, setCharlas] = useState(null);
  const [hayError, setHayError] = useState(false);
  const [salasApi, setSalasApi] = useState(null);
  const [filtros, setFiltros] = useState(leerFiltrosDeUrl);
  const [aviso, setAviso] = useState(errorInicial);
  const [errorInicialVisto, setErrorInicialVisto] = useState(errorInicial);
  const [misReservas, setMisReservas] = useState(null);

  // Si App.jsx manda un aviso nuevo (p. ej. "la sesión ha caducado"), se muestra
  if (errorInicial !== errorInicialVisto) {
    setErrorInicialVisto(errorInicial);
    setAviso(errorInicial);
  }

  // Solo los roles que reservan tienen "mis reservas" (el rol acceso no)
  const gestionaReservas = Boolean(token) && tieneRolQueReserva(usuario);

  useEffect(() => {
    listarCharlas()
      .then(setCharlas)
      .catch((error) => {
        console.error("Error al listar charlas:", error);
        setHayError(true);
        setCharlas([]);
      });

    listarSalas()
      .then(setSalasApi)
      .catch((error) => {
        // Sin el listado de salas seguimos con las que vienen en las charlas
        console.error("Error al listar salas:", error);
        setSalasApi([]);
      });
  }, []);

  // Reservas de la persona: sirven para saber si ya tiene plaza en cada charla
  useEffect(() => {
    if (!gestionaReservas) return undefined;

    let cancelado = false;
    listarMisReservas(token)
      .then((lista) => {
        if (!cancelado) setMisReservas(lista);
      })
      .catch((error) => {
        // Sin la lista se puede seguir reservando: el servidor avisa si ya hay plaza
        console.error("Error al listar mis reservas:", error);
      });

    return () => {
      cancelado = true;
    };
  }, [gestionaReservas, token]);

  // Los filtros viajan en la URL para poder compartir una búsqueda
  useEffect(() => {
    escribirFiltrosEnUrl(filtros);
  }, [filtros]);

  const cargando = charlas === null;

  // Cuando ya hay contenido: al volver con «atrás» (del formulario de acceso o de
  // «Mis reservas») se recupera hasta dónde se había bajado (App.jsx lo guarda en el
  // historial); si no, al abrir un enlace con #seccion se va a esa sección
  useEffect(() => {
    if (cargando) return;
    const scrollGuardado = window.history.state?.scrollY;
    if (typeof scrollGuardado === "number") {
      window.scrollTo({ top: scrollGuardado, behavior: "instant" });
      return;
    }
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [cargando]);

  const reservarCharla = useCallback(
    async (charla) => {
      const reserva = await reservar(token, charla.id);

      // La reserva cuenta ya; después se refrescan las reservas y las plazas libres
      setMisReservas((anteriores) => [
        ...(anteriores ?? []).filter((otra) => otra.id !== reserva.id),
        reserva,
      ]);
      await Promise.all([
        listarMisReservas(token).then(setMisReservas),
        listarCharlas().then(setCharlas),
      ]).catch((error) => {
        console.error("No se pudieron refrescar los datos tras reservar:", error);
      });

      return reserva;
    },
    [token],
  );
  const lista = useMemo(() => charlas ?? [], [charlas]);

  // Área (Salud / Tecnología / Negocios) de cada charla
  const areaDe = useMemo(
    () => new Map(lista.map((charla) => [charla.id, categoriaDe(charla)])),
    [lista],
  );

  const recientes = useMemo(() => charlasRecientes(lista), [lista]);

  // Salas: las de la API; si no llegan, las que aparecen en las charlas
  const salas = useMemo(() => {
    if (salasApi?.length) return salasApi;
    const unicas = new Map();
    for (const charla of lista) {
      if (charla.sala) unicas.set(charla.sala.id, charla.sala);
    }
    return [...unicas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [salasApi, lista]);

  const elegirArea = useCallback(
    (area) => setFiltros((anteriores) => ({ ...anteriores, area })),
    [],
  );

  const verCharla = useCallback(
    (charla) => setFiltros({ ...FILTROS_INICIALES, q: charla.titulo, momento: "todas" }),
    [],
  );

  return (
    <>
      <Header
        usuario={usuario}
        onAcceder={onMostrarAcceso}
        onCerrarSesion={onCerrarSesion}
        onVerMisReservas={onVerMisReservas}
      />

      <main>
        <Hero
          charlas={charlas}
          areaDe={areaDe}
          cargando={cargando}
          onElegirArea={elegirArea}
        />

        <Recientes
          charlas={recientes}
          areaDe={areaDe}
          cargando={cargando}
          onVerCharla={verCharla}
        />

        <Programa
          charlas={charlas}
          areaDe={areaDe}
          salas={salas}
          filtros={filtros}
          setFiltros={setFiltros}
          cargando={cargando}
          hayError={hayError}
          usuario={usuario}
          misReservas={gestionaReservas ? misReservas : null}
          onReservar={reservarCharla}
          onMostrarAcceso={onMostrarAcceso}
          onVerMisReservas={onVerMisReservas}
        />

        <Sedes />

        <Contacto />
      </main>

      <Footer />

      {/* Aviso si no se pudo comprobar la sesión al entrar */}
      {aviso && (
        <div className="AvisoSesion" role="alert">
          <p>{aviso}</p>
          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => setAviso("")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

export default MainView;
