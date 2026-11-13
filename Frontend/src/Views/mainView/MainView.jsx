import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../../components/Header/Header.jsx";
import Hero from "../../components/Hero/Hero.jsx";
import Recientes from "../../components/Recientes/Recientes.jsx";
import Programa from "../../components/Programa/Programa.jsx";
import Sedes from "../../components/Sedes/Sedes.jsx";
import Contacto from "../../components/Contacto/Contacto.jsx";
import Footer from "../../components/footer/footer.jsx";
import { listarCharlas } from "../../api/charlasApi.js";
import { listarSalas } from "../../api/salasApi.js";
import { categoriaDe } from "../../utils/categorias.js";
import { charlasRecientes } from "../../utils/charlas.js";
import {
  FILTROS_INICIALES,
  escribirFiltrosEnUrl,
  leerFiltrosDeUrl,
} from "../../utils/filtros.js";
import "./mainView.css";

/**
 * Página principal de Sabitech (invitado o con sesión iniciada).
 * La sesión la gestiona App.jsx; aquí solo se muestra en el header.
 */
function MainView({
  usuario = null,
  onCerrarSesion,
  onMostrarAcceso,
  errorInicial = "",
}) {
  const [charlas, setCharlas] = useState(null);
  const [hayError, setHayError] = useState(false);
  const [salasApi, setSalasApi] = useState(null);
  const [filtros, setFiltros] = useState(leerFiltrosDeUrl);
  const [aviso, setAviso] = useState(errorInicial);

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

  // Los filtros viajan en la URL para poder compartir una búsqueda
  useEffect(() => {
    escribirFiltrosEnUrl(filtros);
  }, [filtros]);

  const cargando = charlas === null;
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
