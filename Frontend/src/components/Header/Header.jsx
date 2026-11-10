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

// Cada sección tiene su color de marca para el visor del menú.
// "QR" y "Control admin" vienen de la rama login: sus secciones aún no existen.
const SECCIONES = [
  { id: "inicio", texto: "Inicio", marca: "var(--light-teal)" },
  { id: "recientes", texto: "Recientes", marca: "var(--salud)" },
  { id: "charlas", texto: "Programa", marca: "var(--tecnologia)" },
  { id: "donde-estamos", texto: "Dónde estamos", marca: "var(--negocios)" },
  { id: "qr", texto: "QR", marca: "var(--salud)" },
  { id: "admin", texto: "Control admin", marca: "var(--tecnologia)" },
  { id: "contacto", texto: "Contacto", marca: "var(--light-teal)" },
];

const UMBRAL_COMPACTA = 24;
const MENU_EN_LINEA = "(min-width: 1200px)";

const suscribirDesplazamiento = (avisar) => {
  window.addEventListener("scroll", avisar, { passive: true });
  return () => window.removeEventListener("scroll", avisar);
};

const estaDesplazada = () => window.scrollY > UMBRAL_COMPACTA;

const seccionDelHash = () => {
  const id = window.location.hash.slice(1);
  return SECCIONES.some((seccion) => seccion.id === id) ? id : null;
};

function Header({ usuario = null, onAcceder, onCerrarSesion }) {
  const compacta = useSyncExternalStore(
    suscribirDesplazamiento,
    estaDesplazada,
  );
  const [abierta, setAbierta] = useState(false);
  const [activa, setActiva] = useState(
    () => seccionDelHash() ?? SECCIONES[0].id,
  );
  const [apuntada, setApuntada] = useState(null);

  // Menú de la cuenta (solo con sesión iniciada)
  const [menuCuenta, setMenuCuenta] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [errorCuenta, setErrorCuenta] = useState("");

  const entradaRef = useRef(null);
  const conmutadorRef = useRef(null);
  const navegacionRef = useRef(null);
  const visorRef = useRef(null);
  const cuentaRef = useRef(null);
  const botonCuentaRef = useRef(null);

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

  // Cierra el menú de la cuenta al pulsar fuera o con Escape
  useEffect(() => {
    if (!menuCuenta) return undefined;

    const alPulsarFuera = (evento) => {
      if (!cuentaRef.current?.contains(evento.target)) setMenuCuenta(false);
    };
    const alTeclear = (evento) => {
      if (evento.key === "Escape") {
        setMenuCuenta(false);
        botonCuentaRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", alPulsarFuera);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alPulsarFuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [menuCuenta]);

  const cerrar = () => setAbierta(false);

  async function cerrarSesion() {
    setErrorCuenta("");
    setCerrandoSesion(true);
    try {
      await onCerrarSesion?.();
      setMenuCuenta(false);
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
      setErrorCuenta("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    } finally {
      setCerrandoSesion(false);
    }
  }

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
            <p className="Lema">Tu entrada al conocimiento experto</p>
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

          {usuario ? (
            <div className="CuentaZona" ref={cuentaRef}>
              <button
                type="button"
                className="Cuenta"
                ref={botonCuentaRef}
                aria-expanded={menuCuenta}
                aria-controls="menu-cuenta"
                aria-label={`Mi cuenta: ${usuario.nombre} ${usuario.apellidos ?? ""}`.trim()}
                onClick={() => setMenuCuenta((valor) => !valor)}
              >
                <img className="Cuenta__foto" src={FotoCuenta} alt="" />
              </button>

              {menuCuenta && (
                <div id="menu-cuenta" className="MenuCuenta">
                  <p className="MenuCuenta__etiqueta">Sesión iniciada como</p>
                  <p className="MenuCuenta__nombre">
                    {usuario.nombre} {usuario.apellidos}
                  </p>
                  {usuario.email && <p className="MenuCuenta__email">{usuario.email}</p>}

                  {errorCuenta && (
                    <p className="MenuCuenta__error" role="alert">
                      {errorCuenta}
                    </p>
                  )}

                  <button
                    type="button"
                    className="MenuCuenta__salir"
                    onClick={cerrarSesion}
                    disabled={cerrandoSesion}
                  >
                    {cerrandoSesion ? "Cerrando sesión…" : "Cerrar sesión"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="Cuenta"
              aria-label="Iniciar sesión o registrarme"
              title="Iniciar sesión o registrarme"
              onClick={() => {
                cerrar();
                onAcceder?.();
              }}
            >
              <img className="Cuenta__foto" src={FotoCuenta} alt="" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
