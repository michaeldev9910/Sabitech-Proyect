import { useCallback, useEffect, useState } from "react";
import LoginView from "./views/login-view/login-view.jsx";
import MainView from "./views/main-view/main-view.jsx";
import MyBookingsView from "./views/my-bookings-view/my-bookings-view.jsx";
import { cerrarSesion, obtenerUsuario } from "./api/auth-api.js";
import { avisarAlCaducarSesion } from "./api/client.js";
import { ApiError } from "./api/api-error.js";
import { tieneRolQueReserva } from "./utils/bookings.js";

const TOKEN_KEY = "sabitech-auth-token";

// Sin "#seccion": así cualquier enlace a una sección (#charlas…) vuelve a la página principal
const urlSinSeccion = () => `${window.location.pathname}${window.location.search}`;

/**
 * El formulario de acceso y «Mis reservas» no son páginas de verdad sino estados de App:
 * cada vez que se abre uno se añade una entrada al historial ({ pantalla }) para que
 * «atrás» vuelva a la página en vez de salir de la web. La entrada que se deja
 * guarda hasta dónde se había bajado (scrollY) para volver a ese punto.
 */
function abrirPantalla(pantalla) {
  window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, "");
  window.history.pushState({ pantalla }, "", urlSinSeccion());
}

// Al quedarse sin sesión (cerrar sesión o caducar) se vuelve a la portada sin navegar:
// la entrada actual deja de ser «Mis reservas» para que «atrás» no la vuelva a mostrar
function volverAPortadaEnHistorial() {
  if (window.history.state?.pantalla) window.history.replaceState(null, "", urlSinSeccion());
}

function App() {
  const [estado, setEstado] = useState("comprobando");
  // Pantalla de las personas con sesión: "inicio" | "mis-reservas"
  const [pantalla, setPantalla] = useState("inicio");
  // Pantalla a la que ir al iniciar sesión (p. ej. si se pulsó "Mis reservas" sin sesión)
  const [trasAcceso, setTrasAcceso] = useState("inicio");
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [errorSesion, setErrorSesion] = useState("");

  // Si una petición con token devuelve 401, la sesión ha caducado: se vuelve a invitado
  useEffect(
    () =>
      avisarAlCaducarSesion(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        volverAPortadaEnHistorial();
        setToken(null);
        setUsuario(null);
        setPantalla("inicio");
        setErrorSesion("Tu sesión ha caducado. Vuelve a iniciar sesión.");
        setEstado("invitado");
      }),
    [],
  );

  // «Atrás» y «adelante» del navegador (o el gesto del móvil) entre la portada,
  // el formulario de acceso y «Mis reservas». Ver abrirPantalla().
  useEffect(() => {
    const alNavegar = (evento) => {
      const destino = evento.state?.pantalla;

      if (destino === "acceso") {
        // Con sesión el formulario ya no pinta nada: se salta esa entrada del historial
        if (window.localStorage.getItem(TOKEN_KEY)) {
          window.history.back();
          return;
        }
        setEstado((actual) => (actual === "invitado" ? "anonimo" : actual));
        return;
      }

      setPantalla(destino === "mis-reservas" ? "mis-reservas" : "inicio");
      // Si estaba abierto el formulario, «atrás» lo cierra y vuelve a la página
      setEstado((actual) => (actual === "anonimo" ? "invitado" : actual));
    };

    window.addEventListener("popstate", alNavegar);
    return () => window.removeEventListener("popstate", alNavegar);
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function comprobarSesion() {
      try {
        const tokenGuardado = window.localStorage.getItem(TOKEN_KEY);
        if (!tokenGuardado) {
          if (!cancelado) setEstado("invitado");
          return;
        }

        const usuarioActual = await obtenerUsuario(tokenGuardado);
        if (!cancelado) {
          setToken(tokenGuardado);
          setUsuario(usuarioActual);
          setEstado("autenticado");
        }
      } catch (error) {
        console.error("No se pudo comprobar la sesión:", error);

        if (!cancelado) {
          if (error instanceof ApiError && error.status === 401) {
            window.localStorage.removeItem(TOKEN_KEY);
          } else {
            setErrorSesion(
              "No se pudo comprobar la sesión. Continúas como invitado.",
            );
          }
          setEstado("invitado");
        }
      }
    }

    comprobarSesion();
    return () => {
      cancelado = true;
    };
  }, []);

  function iniciarSesion({
    usuario: usuarioAutenticado,
    token: tokenAutenticado,
  }) {
    window.localStorage.setItem(TOKEN_KEY, tokenAutenticado);
    setToken(tokenAutenticado);
    setUsuario(usuarioAutenticado);
    setErrorSesion("");

    const desdeElFormulario = window.history.state?.pantalla === "acceso";
    if (trasAcceso === "mis-reservas") {
      // «Mis reservas» ocupa el sitio del formulario en el historial: «atrás» vuelve a la portada
      if (desdeElFormulario) {
        window.history.replaceState({ pantalla: "mis-reservas" }, "", urlSinSeccion());
      } else {
        abrirPantalla("mis-reservas");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      setPantalla("mis-reservas");
    } else {
      setPantalla("inicio");
      // Quita el formulario del historial y vuelve a la portada, donde se estaba
      if (desdeElFormulario) window.history.back();
    }

    setTrasAcceso("inicio");
    setEstado("autenticado");
  }

  function entrarComoInvitado() {
    setErrorSesion("");
    setTrasAcceso("inicio");
    // Es lo mismo que darle a «atrás»: el formulario sale del historial (ver el popstate)
    if (window.history.state?.pantalla === "acceso") window.history.back();
    else setEstado("invitado");
  }

  // `destino`: "mis-reservas" para ir a esa pantalla al entrar; cualquier otra cosa, el inicio
  function mostrarAcceso(destino) {
    setTrasAcceso(destino === "mis-reservas" ? "mis-reservas" : "inicio");
    abrirPantalla("acceso");
    setEstado("anonimo");
  }

  function verMisReservas() {
    abrirPantalla("mis-reservas");
    window.scrollTo({ top: 0, behavior: "instant" });
    setPantalla("mis-reservas");
  }

  const volverAInicio = useCallback(() => setPantalla("inicio"), []);

  async function salir() {
    await cerrarSesion(token);
    window.localStorage.removeItem(TOKEN_KEY);
    volverAPortadaEnHistorial();
    setToken(null);
    setUsuario(null);
    setPantalla("inicio");
    setEstado("invitado");
  }

  if (estado === "comprobando") {
    return <p role="status">Comprobando la sesión…</p>;
  }

  if (estado === "autenticado") {
    if (pantalla === "mis-reservas" && tieneRolQueReserva(usuario)) {
      return (
        <MyBookingsView
          usuario={usuario}
          token={token}
          onCerrarSesion={salir}
          onVolverAInicio={volverAInicio}
        />
      );
    }

    return (
      <MainView
        usuario={usuario}
        token={token}
        onCerrarSesion={salir}
        onMostrarAcceso={mostrarAcceso}
        onVerMisReservas={verMisReservas}
      />
    );
  }

  if (estado === "invitado") {
    return (
      <MainView
        onMostrarAcceso={mostrarAcceso}
        errorInicial={errorSesion}
      />
    );
  }

  return (
    <LoginView
      onAuthenticated={iniciarSesion}
      onGuest={entrarComoInvitado}
      errorInicial={errorSesion}
    />
  );
}

export default App;
