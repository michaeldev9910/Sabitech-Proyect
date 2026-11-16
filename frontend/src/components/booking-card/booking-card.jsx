import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ApiError } from "../../api/api-error.js";
import { motivoNoCancelable } from "../../utils/bookings.js";
import { MINUTOS_APERTURA_QR } from "../../utils/rules.js";
import {
  formatoFechaLarga,
  horario,
  momentoDe,
  nombresPonentes,
} from "../../utils/talks.js";
import "./booking-card.css";

/**
 * Una reserva de "Mis reservas": datos de la charla, código y estado.
 * Si se puede cancelar, pide confirmación en la propia tarjeta (sin window.confirm).
 */
function TarjetaReserva({ reserva, onCancelar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState("");
  const idTitulo = useId();
  const idPregunta = useId();
  const botonCancelarRef = useRef(null);
  const botonMantenerRef = useRef(null);

  const charla = reserva.charla;
  const confirmada = reserva.estado === "confirmada";
  const momento = charla ? momentoDe(charla) : "celebrada";
  const motivo = motivoNoCancelable(reserva);
  const charlaCancelada = charla?.estado === "cancelada";

  // En una charla ya celebrada no tiene sentido explicar el plazo de 24 h; la asistencia sí
  const mostrarMotivo = confirmada && motivo && (momento !== "celebrada" || reserva.asistida);

  // El foco sigue al botón que aparece, para no perderlo al cambiar la tarjeta
  function pedirConfirmacion() {
    flushSync(() => setConfirmando(true));
    botonMantenerRef.current?.focus();
  }

  function mantener() {
    flushSync(() => setConfirmando(false));
    botonCancelarRef.current?.focus();
  }

  async function confirmarCancelacion() {
    setCancelando(true);
    setError("");

    try {
      // Si va bien, la reserva pasa a "Pasadas o canceladas" y esta tarjeta se desmonta
      await onCancelar(reserva);
    } catch (errorPeticion) {
      console.error("Error al cancelar la reserva:", errorPeticion);
      // 401: la sesión ha caducado y App.jsx ya vuelve al estado de invitado
      if (errorPeticion instanceof ApiError && errorPeticion.status === 401) return;

      flushSync(() => {
        setCancelando(false);
        setConfirmando(false);
        setError(
          errorPeticion instanceof ApiError
            ? errorPeticion.message
            : "No se pudo conectar con el servidor. Inténtalo de nuevo.",
        );
      });
      botonCancelarRef.current?.focus();
    }
  }

  return (
    <article className="Reserva" data-estado={reserva.estado} aria-labelledby={idTitulo}>
      <div className="Reserva__cabecera">
        <h3 id={idTitulo} className="Reserva__titulo">
          {charla?.titulo ?? "Charla"}
        </h3>
        <span className="Reserva__estado" data-estado={reserva.estado}>
          {confirmada ? "Confirmada" : "Cancelada"}
        </span>
      </div>

      <dl className="Reserva__datos">
        {charla && (
          <>
            <div>
              <dt>Fecha</dt>
              <dd className="Reserva__dia">{formatoFechaLarga.format(new Date(charla.inicio))}</dd>
            </div>
            <div>
              <dt>Horario</dt>
              <dd>{horario(charla)}</dd>
            </div>
            {charla.sala && (
              <div>
                <dt>Sala</dt>
                <dd>
                  {charla.sala.nombre}
                  {charla.sala.ubicacion && ` · ${charla.sala.ubicacion}`}
                </dd>
              </div>
            )}
            <div>
              <dt>Ponentes</dt>
              <dd>{nombresPonentes(charla.ponentes)}</dd>
            </div>
          </>
        )}
        <div>
          <dt>Código</dt>
          <dd>
            <code className="Reserva__codigo">{reserva.codigo}</code>
          </dd>
        </div>
      </dl>

      <div className="Reserva__pie">
        {!confirmada && charlaCancelada && (
          <p className="Reserva__nota Reserva__nota--aviso">
            Charla cancelada por la organización
          </p>
        )}

        {confirmada && momento === "proxima" && (
          <p className="Reserva__nota Reserva__nota--qr">
            Tu QR estará disponible {MINUTOS_APERTURA_QR} minutos antes del inicio
          </p>
        )}

        {mostrarMotivo && <p className="Reserva__nota">{motivo}</p>}

        {confirmada && !motivo && !confirmando && (
          <button
            type="button"
            ref={botonCancelarRef}
            className="Reserva__cancelar"
            onClick={pedirConfirmacion}
          >
            Cancelar reserva
          </button>
        )}

        {confirmando && (
          <div className="Reserva__confirmar" role="group" aria-labelledby={idPregunta}>
            <p id={idPregunta}>
              ¿Seguro que quieres cancelar tu plaza? Si cambias de idea, podrás
              volver a reservar mientras queden plazas.
            </p>
            <div className="Reserva__botones">
              <button
                type="button"
                className="Reserva__si"
                onClick={confirmarCancelacion}
                disabled={cancelando}
              >
                {cancelando ? "Cancelando…" : "Sí, cancelar"}
              </button>
              <button
                type="button"
                ref={botonMantenerRef}
                className="Reserva__no"
                onClick={mantener}
                disabled={cancelando}
              >
                No, mantener la reserva
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="Reserva__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}

export default TarjetaReserva;
