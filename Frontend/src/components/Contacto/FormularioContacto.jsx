import { useEffect, useId, useRef, useState } from "react";
import { ApiError } from "../../api/apiError.js";
import { enviarContacto } from "../../api/contactoApi.js";
import "./FormularioContacto.css";

const CAMPOS_INICIALES = {
  nombre: "",
  email: "",
  asunto: "",
  mensaje: "",
  privacidad: false,
  // Honeypot: campo oculto que solo rellenan los bots
  web: "",
};

/**
 * Popup con el formulario de contacto.
 * Usa <dialog> nativo: el navegador gestiona el foco, la tecla Escape y el fondo.
 */
function FormularioContacto({ abierto, onCerrar }) {
  const refDialogo = useRef(null);
  const id = useId();

  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [estado, setEstado] = useState("inicial"); // inicial | enviando | enviado
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");

  // Sincroniza la prop "abierto" con el <dialog>
  useEffect(() => {
    const dialogo = refDialogo.current;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  function cambiar(evento) {
    const { name, type, value, checked } = evento.target;
    setCampos((anteriores) => ({
      ...anteriores,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Se ejecuta siempre que el <dialog> se cierra (botón, Escape o clic fuera)
  function alCerrar() {
    if (estado === "enviado") {
      setCampos(CAMPOS_INICIALES);
      setEstado("inicial");
    }
    setErrores({});
    setErrorGeneral("");
    onCerrar();
  }

  function cerrar() {
    refDialogo.current.close();
  }

  async function enviar(evento) {
    evento.preventDefault();
    setEstado("enviando");
    setErrores({});
    setErrorGeneral("");

    try {
      await enviarContacto(campos);
      setEstado("enviado");
    } catch (error) {
      console.error("Error al enviar el formulario de contacto:", error);

      if (error instanceof ApiError && error.status === 422) {
        setErrores(error.errors ?? {});
        setErrorGeneral("Revisa los campos marcados.");
      } else if (error instanceof ApiError && error.status === 429) {
        setErrorGeneral(
          "Has enviado varios mensajes seguidos. Espera un minuto y vuelve a intentarlo.",
        );
      } else {
        setErrorGeneral(
          "No se pudo enviar el mensaje. Inténtalo de nuevo en unos minutos.",
        );
      }
      setEstado("inicial");
    }
  }

  const enviando = estado === "enviando";

  // Props comunes de cada campo: enlazan el error con el input para lectores de pantalla
  function propsDe(nombre) {
    return {
      id: `${id}-${nombre}`,
      name: nombre,
      value: campos[nombre],
      onChange: cambiar,
      disabled: enviando,
      "aria-invalid": errores[nombre] ? true : undefined,
      "aria-describedby": errores[nombre] ? `${id}-${nombre}-error` : undefined,
    };
  }

  function errorDe(nombre) {
    if (!errores[nombre]) return null;
    return (
      <p id={`${id}-${nombre}-error`} className="FormularioContacto__error">
        {errores[nombre][0]}
      </p>
    );
  }

  return (
    <dialog
      ref={refDialogo}
      className="FormularioContacto"
      aria-labelledby={`${id}-titulo`}
      onClose={alCerrar}
      onClick={(evento) => {
        // Clic en el fondo (fuera de la tarjeta) cierra el popup
        if (evento.target === refDialogo.current) cerrar();
      }}
    >
      <div className="FormularioContacto__tarjeta">
        <button
          type="button"
          className="FormularioContacto__cerrar"
          aria-label="Cerrar"
          onClick={cerrar}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {estado === "enviado" ? (
          <div className="FormularioContacto__exito" role="status">
            <h2 id={`${id}-titulo`}>Mensaje enviado</h2>
            <p>
              Gracias por escribirnos. Te responderemos al correo que nos has
              indicado.
            </p>
            <button
              type="button"
              className="Contacto__boton Contacto__boton--principal"
              onClick={cerrar}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form className="FormularioContacto__formulario" onSubmit={enviar}>
            <h2 id={`${id}-titulo`}>Escríbenos</h2>
            <p className="FormularioContacto__intro">
              Cuéntanos tu propuesta de charla o tu consulta y te responderemos
              por correo.
            </p>

            <div className="Contacto__campo">
              <label htmlFor={`${id}-nombre`}>Nombre</label>
              <input
                type="text"
                autoComplete="name"
                maxLength={100}
                required
                {...propsDe("nombre")}
              />
              {errorDe("nombre")}
            </div>

            <div className="Contacto__campo">
              <label htmlFor={`${id}-email`}>Correo electrónico</label>
              <input
                type="email"
                autoComplete="email"
                maxLength={255}
                required
                {...propsDe("email")}
              />
              {errorDe("email")}
            </div>

            <div className="Contacto__campo">
              <label htmlFor={`${id}-asunto`}>Asunto</label>
              <input
                type="text"
                maxLength={150}
                required
                {...propsDe("asunto")}
              />
              {errorDe("asunto")}
            </div>

            <div className="Contacto__campo">
              <label htmlFor={`${id}-mensaje`}>¿Qué necesitas?</label>
              <textarea
                rows={5}
                minLength={10}
                maxLength={5000}
                required
                {...propsDe("mensaje")}
              />
              {errorDe("mensaje")}
            </div>

            {/* Honeypot: oculto para personas y lectores de pantalla */}
            <div className="FormularioContacto__trampa" aria-hidden="true">
              <label htmlFor={`${id}-web`}>No rellenes este campo</label>
              <input
                type="text"
                id={`${id}-web`}
                name="web"
                tabIndex={-1}
                autoComplete="off"
                value={campos.web}
                onChange={cambiar}
              />
            </div>

            <div>
              <label className="FormularioContacto__privacidad">
                <input
                  type="checkbox"
                  name="privacidad"
                  checked={campos.privacidad}
                  onChange={cambiar}
                  disabled={enviando}
                  required
                />
                <span>
                  Acepto que Sabitech use estos datos únicamente para responder
                  a mi mensaje.
                </span>
              </label>
              {errorDe("privacidad")}
            </div>

            {errorGeneral && (
              <p className="FormularioContacto__aviso" role="alert">
                {errorGeneral}
              </p>
            )}

            <div className="FormularioContacto__acciones">
              <button
                type="button"
                className="Contacto__boton"
                onClick={cerrar}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="Contacto__boton Contacto__boton--principal"
                disabled={enviando}
              >
                {enviando ? "Enviando…" : "Enviar mensaje"}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}

export default FormularioContacto;
