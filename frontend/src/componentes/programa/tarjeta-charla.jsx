import { useEffect, useId, useRef, useState } from "react";
import Retrato from "../retrato/retrato.jsx";
import { ApiError } from "../../api/error-api.js";
import { categoriaPorId } from "../../utilidades/categorias.js";
import {
  puedeReservar,
  reservaConfirmadaDe,
  reservasAbiertas,
  tieneRolQueReserva,
} from "../../utilidades/reservas.js";
import {
  ETIQUETA_MOMENTO,
  estadoPlazas,
  formatoDia,
  formatoFechaLarga,
  formatoMes,
  horario,
  momentoDe,
  nombreCompleto,
  nombresPonentes,
  organizacionesPonentes,
} from "../../utilidades/charlas.js";

/**
 * Tarjeta tipo foto: muestra al ponente y, al pasar el ratón por encima
 * (o al enfocarla / tocarla en móvil), revela la información de la charla.
 */
function TarjetaCharla({
  charla,
  area,
  usuario = null,
  misReservas = null,
  onReservar,
  onMostrarAcceso,
  onVerMisReservas,
}) {
  const [abierta, setAbierta] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: "exito" | "error", texto }
  const idDetalle = useId();
  const misReservasRef = useRef(null);

  const categoria = categoriaPorId(area);
  const momento = momentoDe(charla);
  const plazas = estadoPlazas(charla);
  const inicio = new Date(charla.inicio);
  const ponentes = charla.ponentes;
  const organizaciones = organizacionesPonentes(ponentes);
  const tienePlaza = Boolean(reservaConfirmadaDe(charla, misReservas));

  // Tras reservar, el botón desaparece: el foco pasa a "Mis reservas" para no perderlo
  useEffect(() => {
    if (aviso?.tipo === "exito") misReservasRef.current?.focus();
  }, [aviso]);

  async function reservarPlaza(evento) {
    // La tarjeta entera abre/cierra al hacer clic: el botón no debe cerrarla
    evento.stopPropagation();
    setReservando(true);
    setAviso(null);

    try {
      const reserva = await onReservar(charla);
      setAviso({
        tipo: "exito",
        texto: reserva?.codigo
          ? `Plaza reservada. Tu código es ${reserva.codigo}.`
          : "Plaza reservada.",
      });
    } catch (error) {
      console.error("Error al reservar plaza:", error);
      // 401: la sesión ha caducado y App.jsx ya vuelve al estado de invitado con su aviso
      if (error instanceof ApiError && error.status === 401) return;
      setAviso({
        tipo: "error",
        texto:
          error instanceof ApiError
            ? error.message
            : "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      });
    } finally {
      setReservando(false);
    }
  }

  // Acción de reserva según la sesión. El rol "acceso" no reserva: no se muestra nada.
  let accion = null;
  if (!usuario) {
    if (reservasAbiertas(charla)) {
      accion = (
        <button
          type="button"
          className="Tarjeta__reservar"
          onClick={(evento) => {
            evento.stopPropagation();
            onMostrarAcceso?.();
          }}
        >
          Inicia sesión para reservar
        </button>
      );
    }
  } else if (tieneRolQueReserva(usuario)) {
    if (tienePlaza) {
      accion = (
        <p className="Tarjeta__tienes-plaza">
          Ya tienes plaza
          <button
            type="button"
            ref={misReservasRef}
            className="Tarjeta__enlace"
            onClick={(evento) => {
              evento.stopPropagation();
              onVerMisReservas?.();
            }}
          >
            Mis reservas
          </button>
        </p>
      );
    } else if (puedeReservar(usuario, charla, misReservas)) {
      accion = (
        <button
          type="button"
          className="Tarjeta__reservar"
          onClick={reservarPlaza}
          disabled={reservando}
        >
          {reservando ? "Reservando…" : "Reservar plaza"}
        </button>
      );
    }
  }

  return (
    <article
      className="Tarjeta"
      data-area={area}
      data-abierta={abierta}
      data-momento={momento}
      onClick={() => setAbierta((valor) => !valor)}
    >
      <Retrato ponente={ponentes[0]} area={area} className="Tarjeta__foto" />
      <span className="Tarjeta__velo" aria-hidden="true" />

      <div className="Tarjeta__superior">
        <span className="Etiqueta">{categoria.nombre}</span>
        <time className="Tarjeta__fecha" dateTime={charla.inicio}>
          <strong>{formatoDia.format(inicio)}</strong>
          <span>{formatoMes.format(inicio).replace(".", "")}</span>
        </time>
      </div>

      <div className="Tarjeta__base">
        {momento !== "proxima" && (
          <span className={`Tarjeta__momento Tarjeta__momento--${momento}`}>
            {ETIQUETA_MOMENTO[momento]}
          </span>
        )}
        <h3 className="Tarjeta__nombre">{nombresPonentes(ponentes)}</h3>
        {organizaciones && <p className="Tarjeta__organizacion">{organizaciones}</p>}
        <p className="Tarjeta__resumen">{charla.titulo}</p>
      </div>

      {/* Va antes del detalle para que, con el teclado, el siguiente Tab llegue a sus botones */}
      <button
        type="button"
        className="Tarjeta__conmutador"
        aria-expanded={abierta}
        aria-controls={idDetalle}
        onClick={(evento) => {
          // La tarjeta entera también abre/cierra (útil en táctil): evitamos el doble clic
          evento.stopPropagation();
          setAbierta((valor) => !valor);
        }}
      >
        <span className="sr-only">
          {abierta ? "Ocultar" : "Ver"} detalles de «{charla.titulo}»
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <div className="Tarjeta__detalle" id={idDetalle}>
        <span className="Etiqueta">{categoria.nombre}</span>
        <h4 className="Tarjeta__titulo">{charla.titulo}</h4>
        {charla.descripcion && <p className="Tarjeta__descripcion">{charla.descripcion}</p>}

        <dl className="Tarjeta__datos">
          <div>
            <dt>Fecha</dt>
            <dd className="Tarjeta__dia">{formatoFechaLarga.format(inicio)}</dd>
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
        </dl>

        {ponentes
          .filter((ponente) => ponente.biografia)
          .map((ponente) => (
            <p key={ponente.id} className="Tarjeta__bio">
              <strong>{nombreCompleto(ponente)}:</strong> {ponente.biografia}
            </p>
          ))}

        <p className="Tarjeta__plazas" data-tono={plazas.tono}>
          {plazas.texto}
        </p>

        {(accion || aviso) && (
          <div className="Tarjeta__reserva">
            {accion}
            {aviso && (
              <p
                className={`Tarjeta__aviso Tarjeta__aviso--${aviso.tipo}`}
                role={aviso.tipo === "error" ? "alert" : "status"}
              >
                {aviso.texto}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default TarjetaCharla;
