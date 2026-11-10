import { useEffect, useState } from "react";
import LoginView from "./Views/loginView/loginView.jsx";
import MainView from "./Views/mainView/MainView.jsx";
import { cerrarSesion, obtenerUsuario } from "./api/authApi.js";
import { ApiError } from "./api/apiError.js";

const TOKEN_KEY = "sabitech-auth-token";

function App() {
  const [estado, setEstado] = useState("comprobando");
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [errorSesion, setErrorSesion] = useState("");

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
    setEstado("autenticado");
  }

  function entrarComoInvitado() {
    setErrorSesion("");
    setEstado("invitado");
  }

  function mostrarAcceso() {
    setEstado("anonimo");
  }

  async function salir() {
    await cerrarSesion(token);
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUsuario(null);
    setEstado("invitado");
  }

  if (estado === "comprobando") {
    return <p role="status">Comprobando la sesión…</p>;
  }

  if (estado === "autenticado") {
    return (
      <MainView
        usuario={usuario}
        onCerrarSesion={salir}
        onMostrarAcceso={mostrarAcceso}
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
