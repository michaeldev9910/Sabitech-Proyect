import { useId, useState } from "react";
import Retrato from "../Retrato/Retrato.jsx";
import { categoriaPorId } from "../../utils/categorias.js";
import {
  ETIQUETA_MOMENTO,
  estadoPlazas,
  formatoDia,
  formatoFechaLarga,
  formatoMes,
  horario,
  momentoDe,
  nombreCompleto,
} from "../../utils/charlas.js";

/**
 * Tarjeta tipo foto: muestra al ponente y, al pasar el ratón por encima
 * (o al enfocarla / tocarla en móvil), revela la información de la charla.
 */
function TarjetaCharla({ charla, area }) {
  const [abierta, setAbierta] = useState(false);
  const idDetalle = useId();

  const categoria = categoriaPorId(area);
  const momento = momentoDe(charla);
  const plazas = estadoPlazas(charla);
  const inicio = new Date(charla.inicio);
  const ponente = charla.ponente;

  return (
    <article
      className="Tarjeta"
      data-area={area}
      data-abierta={abierta}
      data-momento={momento}
      onClick={() => setAbierta((valor) => !valor)}
    >
      <Retrato ponente={ponente} area={area} className="Tarjeta__foto" />
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
        <h3 className="Tarjeta__nombre">{nombreCompleto(ponente)}</h3>
        {ponente?.organizacion && <p className="Tarjeta__organizacion">{ponente.organizacion}</p>}
        <p className="Tarjeta__resumen">{charla.titulo}</p>
      </div>

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

        {ponente?.biografia && <p className="Tarjeta__bio">{ponente.biografia}</p>}

        <p className="Tarjeta__plazas" data-tono={plazas.tono}>
          {plazas.texto}
        </p>
      </div>

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
    </article>
  );
}

export default TarjetaCharla;
