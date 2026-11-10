import { useState } from "react";
import { iniciarSesion, registrarUsuario } from "../../api/loginApi.js";
import "./loginView.css";

function mensajeDeError(error) {
  const erroresValidacion = Object.values(error.errors ?? {}).flat();
  return erroresValidacion.length > 0
    ? erroresValidacion.join(" ")
    : error.message || "No se pudo completar la operación.";
}

function LoginView({ onAuthenticated, onGuest, errorInicial = "" }) {
  const [modo, setModo] = useState("login");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(errorInicial);
  const [enviando, setEnviando] = useState(false);
  const esRegistro = modo === "registro";

  async function enviarFormulario(evento) {
    evento.preventDefault();
    setError("");
    setEnviando(true);

    try {
      const datos = esRegistro
        ? await registrarUsuario({ nombre, apellidos, email, password })
        : await iniciarSesion({ email, password });
      onAuthenticated(datos);
    } catch (errorPeticion) {
      console.error("Error de autenticación:", errorPeticion);
      setError(mensajeDeError(errorPeticion));
    } finally {
      setEnviando(false);
    }
  }

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    setError("");
  }

  return (
    <main className="VistaAcceso">
      <section className="TarjetaAcceso" aria-labelledby="titulo-acceso">
        <p className="AccesoMarca" aria-hidden="true">
          sabi<span>tech</span>
        </p>
        <h1 id="titulo-acceso">
          {esRegistro ? "Crear cuenta" : "Iniciar sesión"}
        </h1>
        <p>
          {esRegistro
            ? "Regístrate para acceder a tu cuenta de Sabitech."
            : "Inicia sesión para ver el contenido de Sabitech."}
        </p>

        <form className="FormularioAcceso" onSubmit={enviarFormulario}>
          {esRegistro && (
            <>
              <label>
                Nombre
                <input
                  autoComplete="given-name"
                  required
                  maxLength={100}
                  value={nombre}
                  onChange={(evento) => setNombre(evento.target.value)}
                />
              </label>
              <label>
                Apellidos
                <input
                  autoComplete="family-name"
                  required
                  maxLength={150}
                  value={apellidos}
                  onChange={(evento) => setApellidos(evento.target.value)}
                />
              </label>
            </>
          )}

          <label>
            Correo electrónico
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              autoComplete={esRegistro ? "new-password" : "current-password"}
              required
              minLength={esRegistro ? 8 : undefined}
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
            />
          </label>

          {error && <p className="ErrorAcceso" role="alert">{error}</p>}

          <button type="submit" disabled={enviando}>
            {enviando
              ? "Un momento…"
              : esRegistro
                ? "Registrarme"
                : "Entrar"}
          </button>
        </form>

        <p className="AlternarAcceso">
          {esRegistro ? "¿Ya tienes una cuenta?" : "¿Todavía no tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => cambiarModo(esRegistro ? "login" : "registro")}
          >
            {esRegistro ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
        <button
          className="AccesoInvitado"
          type="button"
          onClick={onGuest}
        >
          Entrar como invitado
        </button>
      </section>
    </main>
  );
}

export default LoginView;