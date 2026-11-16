import { useCallback, useEffect, useState } from "react";
import LoginView from "./views/login-view/login-view.jsx";
import MainView from "./views/main-view/main-view.jsx";
import MyBookingsView from "./views/my-bookings-view/my-bookings-view.jsx";
import { cerrarSesion, obtenerUsuario } from "./api/auth-api.js";
import { avisarAlCaducarSesion } from "./api/client.js";
import { ApiError } from "./api/api-error.js";
import { tieneRolQueReserva } from "./utils/bookings.js";

const TOKEN_KEY = "sabitech-auth-token";

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
        setToken(null);
        setUsuario(null);
        setPantalla("inicio");
        setErrorSesion("Tu sesión ha caducado. Vuelve a iniciar sesión.");
        setEstado("invitado");
      }),
    [],
  );

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
    if (trasAcceso === "mis-reservas") verMisReservas();
    else setPantalla("inicio");
    setTrasAcceso("inicio");
    setEstado("autenticado");
  }

  function entrarComoInvitado() {
    setErrorSesion("");
    setTrasAcceso("inicio");
    setEstado("invitado");
  }

  // `destino`: "mis-reservas" para ir a esa pantalla al entrar; cualquier otra cosa, el inicio
  function mostrarAcceso(destino) {
    setTrasAcceso(destino === "mis-reservas" ? "mis-reservas" : "inicio");
    setEstado("anonimo");
  }

  function verMisReservas() {
    // Sin "#seccion" en la URL: así cualquier enlace a una sección (#charlas…) vuelve a la página principal
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    window.scrollTo({ top: 0, behavior: "instant" });
    setPantalla("mis-reservas");
  }

  const volverAInicio = useCallback(() => setPantalla("inicio"), []);

  async function salir() {
    await cerrarSesion(token);
    window.localStorage.removeItem(TOKEN_KEY);
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
