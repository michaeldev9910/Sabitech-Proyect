import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import "./Header.css";
import FotoCuenta from "../../assets/esteban.svg";
import { irAlBuscador } from "../../utils/navegacion.js";

// Cada sección tiene su color de marca para el visor del menú
const SECCIONES = [
  { id: "inicio", texto: "Inicio", marca: "var(--light-teal)" },
  { id: "recientes", texto: "Recientes", marca: "var(--salud)" },
  { id: "charlas", texto: "Programa", marca: "var(--tecnologia)" },
  { id: "donde-estamos", texto: "Dónde estamos", marca: "var(--negocios)" },
  { id: "contacto", texto: "Contacto", marca: "var(--light-teal)" },
];

const UMBRAL_COMPACTA = 24;
const MENU_EN_LINEA = "(min-width: 1080px)";

const suscribirDesplazamiento = (avisar) => {
  window.addEventListener("scroll", avisar, { passive: true });
  return () => window.removeEventListener("scroll", avisar);
};

const estaDesplazada = () => window.scrollY > UMBRAL_COMPACTA;

const seccionDelHash = () => {
  const id = window.location.hash.slice(1);
  return SECCIONES.some((seccion) => seccion.id === id) ? id : null;
};

function Header() {
  const compacta = useSyncExternalStore(
    suscribirDesplazamiento,
    estaDesplazada,
  );
  const [abierta, setAbierta] = useState(false);
  const [activa, setActiva] = useState(
    () => seccionDelHash() ?? SECCIONES[0].id,
  );
  const [apuntada, setApuntada] = useState(null);

  const entradaRef = useRef(null);
  const conmutadorRef = useRef(null);
  const navegacionRef = useRef(null);
  const visorRef = useRef(null);

  const destino = apuntada ?? activa;
  const marcaDestino = SECCIONES.find(({ id }) => id === destino).marca;

  // Visor: el marco con esquinas que se desliza hasta el enlace activo
  useLayoutEffect(() => {
    const navegacion = navegacionRef.current;
    const visor = visorRef.current;

    const colocar = () => {
      const enlace = navegacion.querySelector(`[data-seccion="${destino}"]`);
      if (!enlace) return;
      visor.style.setProperty("--x", `${enlace.offsetLeft}px`);
      visor.style.setProperty("--y", `${enlace.offsetTop}px`);
      visor.style.setProperty("--ancho", `${enlace.offsetWidth}px`);
      visor.style.setProperty("--alto-enlace", `${enlace.offsetHeight}px`);
    };

    colocar();
    const observador = new ResizeObserver(colocar);
    observador.observe(navegacion);
    document.fonts?.ready.then(colocar);
    return () => observador.disconnect();
  }, [destino]);

  useEffect(() => {
    const fotograma = requestAnimationFrame(() => {
      visorRef.current.dataset.listo = "true";
    });
    return () => cancelAnimationFrame(fotograma);
  }, []);

  // Sección activa según el scroll o el hash de la URL
  useEffect(() => {
    const alCambiarHash = () => {
      const id = seccionDelHash();
      if (id) setActiva(id);
    };

    let fotograma = 0;
    const alDesplazar = () => {
      cancelAnimationFrame(fotograma);
      fotograma = requestAnimationFrame(() => {
        const { scrollHeight } = document.documentElement;
        const alFinal = window.innerHeight + window.scrollY >= scrollHeight - 1;
        const linea = alFinal ? Infinity : window.innerHeight / 3;
        const alcanzada = SECCIONES.filter(({ id }) => {
          const seccion = document.getElementById(id);
          return seccion && seccion.getBoundingClientRect().top <= linea;
        }).at(-1);
        if (alcanzada) setActiva(alcanzada.id);
      });
    };

    window.addEventListener("hashchange", alCambiarHash);
    const dejarDeEscuchar = suscribirDesplazamiento(alDesplazar);
    return () => {
      window.removeEventListener("hashchange", alCambiarHash);
      dejarDeEscuchar();
      cancelAnimationFrame(fotograma);
    };
  }, []);

  // Cierra el menú móvil al pulsar fuera, con Escape o al ensanchar la ventana
  useEffect(() => {
    if (!abierta) return undefined;

    const alPulsarFuera = (evento) => {
      if (!entradaRef.current.contains(evento.target)) setAbierta(false);
    };
    const alTeclear = (evento) => {
      if (evento.key === "Escape") {
        setAbierta(false);
        conmutadorRef.current.focus();
      }
    };
    const consultaMenu = window.matchMedia(MENU_EN_LINEA);
    const alCambiarAncho = () => setAbierta(false);

    document.addEventListener("pointerdown", alPulsarFuera);
    document.addEventListener("keydown", alTeclear);
    consultaMenu.addEventListener("change", alCambiarAncho);
    return () => {
      document.removeEventListener("pointerdown", alPulsarFuera);
      document.removeEventListener("keydown", alTeclear);
      consultaMenu.removeEventListener("change", alCambiarAncho);
    };
  }, [abierta]);

  const cerrar = () => setAbierta(false);

  return (
    <header
      className="Cabecera"
      data-compacta={compacta}
      data-abierta={abierta}
    >
      <div className="Entrada" ref={entradaRef}>
        {/* CUERPO de la entrada */}
        <div className="Cuerpo">
          <span className="Papel" aria-hidden="true" />

          <div className="Marca">
            <a href="#inicio" className="Logo" aria-label="Sabitech, ir al inicio">
              sabi<span>tech</span>
            </a>
            <p className="Lema">
              <strong>Tu entrada al conocimiento experto</strong>
              <span>Salud · Tecnología · Negocios</span>
            </p>
          </div>

          <button
            type="button"
            className="BotonBuscar"
            aria-label="Buscar charlas (atajo: tecla /)"
            title="Buscar charlas ( / )"
            onClick={() => {
              cerrar();
              irAlBuscador();
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          <button
            type="button"
            className="Conmutador"
            ref={conmutadorRef}
            aria-expanded={abierta}
            aria-controls="menu-principal"
            aria-label={abierta ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setAbierta((valor) => !valor)}
          >
            <span />
            <span />
            <span />
            <span />
          </button>

          <nav
            id="menu-principal"
            className="Navegacion"
            aria-label="Principal"
            ref={navegacionRef}
          >
            <span
              className="Visor"
              ref={visorRef}
              style={{ "--marca": marcaDestino }}
              aria-hidden="true"
            />
            <ul
              className="Menu"
              onPointerLeave={() => setApuntada(null)}
              onBlur={() => setApuntada(null)}
            >
              {SECCIONES.map(({ id, texto, marca }, indice) => (
                <li key={id} style={{ "--marca": marca, "--orden": indice }}>
                  <a
                    href={`#${id}`}
                    data-seccion={id}
                    aria-current={activa === id ? "location" : undefined}
                    onPointerEnter={(evento) => {
                      if (evento.pointerType !== "touch") setApuntada(id);
                    }}
                    onFocus={() => setApuntada(id)}
                    onClick={cerrar}
                  >
                    {texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* TALÓN de la entrada */}
        <div className="Talon">
          <span className="Papel" aria-hidden="true" />

          <a href="#charlas" className="Accion" onClick={cerrar}>
            Reservar plaza
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </a>

          <a href="#cuenta" className="Cuenta" aria-label="Mi cuenta">
            <svg viewBox="0 0 56 56" aria-hidden="true">
              <path d="M2 14V9a7 7 0 0 1 7-7h5" stroke="var(--salud)" />
              <path d="M42 2h5a7 7 0 0 1 7 7v5" stroke="var(--tecnologia)" />
              <path d="M54 42v5a7 7 0 0 1-7 7h-5" stroke="var(--negocios)" />
              <path d="M14 54H9a7 7 0 0 1-7-7v-5" stroke="var(--light-teal)" />
            </svg>
            <img src={FotoCuenta} alt="" />
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
