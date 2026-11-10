import { memo, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Carousel from "bootstrap/js/dist/carousel";
import Retrato from "../Retrato/Retrato.jsx";
import { categoriaPorId } from "../../utils/categorias.js";
import {
  ETIQUETA_MOMENTO,
  estadoPlazas,
  formatoFechaLarga,
  horario,
  momentoDe,
  nombreCompleto,
} from "../../utils/charlas.js";
import "../../styles/bootstrap-carrusel.scss";
import "./Recientes.css";

const INTERVALO = 7000;
const ID_CARRUSEL = "carrusel-recientes";

const consultaMovimiento = "(prefers-reduced-motion: reduce)";
const suscribirMovimiento = (avisar) => {
  const consulta = window.matchMedia(consultaMovimiento);
  consulta.addEventListener("change", avisar);
  return () => consulta.removeEventListener("change", avisar);
};
const prefiereSinMovimiento = () => window.matchMedia(consultaMovimiento).matches;

function Diapositiva({ charla, area, activa, onVerCharla }) {
  const categoria = categoriaPorId(area);
  const momento = momentoDe(charla);
  const plazas = estadoPlazas(charla);

  return (
    <div
      className={`carousel-item ${activa ? "active" : ""}`}
      role="group"
      aria-roledescription="diapositiva"
      aria-label={charla.titulo}
    >
      <article className="Diapositiva" data-area={area}>
        <div className="Diapositiva__visual">
          <Retrato ponente={charla.ponente} area={area} className="Diapositiva__retrato" />
          <span className={`Diapositiva__momento Diapositiva__momento--${momento}`}>
            {ETIQUETA_MOMENTO[momento]}
          </span>
        </div>

        <div className="Diapositiva__info">
          <span className="Etiqueta">{categoria.nombre}</span>

          <h3 className="Diapositiva__titulo">{charla.titulo}</h3>

          {charla.descripcion && (
            <p className="Diapositiva__descripcion">{charla.descripcion}</p>
          )}

          <dl className="Diapositiva__datos">
            <div>
              <dt>Fecha</dt>
              <dd className="Diapositiva__fecha">{formatoFechaLarga.format(new Date(charla.inicio))}</dd>
            </div>
            <div>
              <dt>Horario</dt>
              <dd>{horario(charla)}</dd>
            </div>
            {charla.sala && (
              <div>
                <dt>Sala</dt>
                <dd>{charla.sala.nombre}</dd>
              </div>
            )}
            <div>
              <dt>Plazas</dt>
              <dd data-tono={plazas.tono}>{plazas.texto}</dd>
            </div>
          </dl>

          <div className="Diapositiva__pie">
            <p className="Diapositiva__ponente">
              <strong>{nombreCompleto(charla.ponente)}</strong>
              {charla.ponente?.organizacion && <span>{charla.ponente.organizacion}</span>}
            </p>

            <a
              href="#charlas"
              className="Diapositiva__boton"
              onClick={() => onVerCharla(charla)}
            >
              Ver en el programa
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

function Recientes({ charlas, areaDe, cargando, onVerCharla }) {
  const carruselRef = useRef(null);
  const sinMovimiento = useSyncExternalStore(suscribirMovimiento, prefiereSinMovimiento);
  const [enPausa, setEnPausa] = useState(false);
  const automatico = !sinMovimiento && !enPausa;

  // Bootstrap Carousel: se crea al montar y se recrea al pausar/reanudar
  useEffect(() => {
    const elemento = carruselRef.current;
    if (!elemento || charlas.length === 0) return undefined;

    const carrusel = Carousel.getOrCreateInstance(elemento, {
      interval: automatico ? INTERVALO : false,
      ride: automatico ? "carousel" : false,
      pause: "hover",
      touch: true,
      keyboard: true,
    });

    return () => carrusel.dispose();
  }, [automatico, charlas.length]);

  return (
    <section
      id="recientes"
      className="Recientes"
      aria-labelledby="recientes-titulo"
    >
      <div className="Recientes__contenedor">
        <header className="Recientes__cabecera">
          <div>
            <p className="Recientes__antetitulo">Agenda</p>
            <h2 id="recientes-titulo" className="Recientes__titulo">
              Charlas recientes
            </h2>
          </div>
          <p className="Recientes__intro">
            Lo que está pasando ahora en Sabitech: sesiones en directo, recién
            celebradas y las que están a punto de empezar.
          </p>
        </header>

        {cargando && <div className="Recientes__esqueleto" aria-hidden="true" />}

        {!cargando && charlas.length === 0 && (
          <p className="Recientes__vacio">
            Todavía no hay charlas recientes que mostrar.
          </p>
        )}

        {!cargando && charlas.length > 0 && (
          <div
            id={ID_CARRUSEL}
            ref={carruselRef}
            className="carousel slide Recientes__carrusel"
            data-automatico={automatico}
            role="region"
            aria-roledescription="carrusel"
            aria-label="Charlas recientes"
            style={{ "--intervalo": `${INTERVALO}ms` }}
          >
            <div className="carousel-inner">
              {charlas.map((charla, indice) => (
                <Diapositiva
                  key={charla.id}
                  charla={charla}
                  area={areaDe.get(charla.id)}
                  activa={indice === 0}
                  onVerCharla={onVerCharla}
                />
              ))}
            </div>

            <div className="Recientes__controles">
              <div className="carousel-indicators">
                {charlas.map((charla, indice) => (
                  <button
                    key={charla.id}
                    type="button"
                    data-bs-target={`#${ID_CARRUSEL}`}
                    data-bs-slide-to={indice}
                    className={indice === 0 ? "active" : undefined}
                    aria-current={indice === 0 ? "true" : undefined}
                    aria-label={`Ir a la charla ${indice + 1}: ${charla.titulo}`}
                  />
                ))}
              </div>

              <div className="Recientes__botones">
                {!sinMovimiento && (
                  <button
                    type="button"
                    className="Recientes__boton"
                    aria-label={enPausa ? "Reanudar el carrusel" : "Pausar el carrusel"}
                    onClick={() => setEnPausa((valor) => !valor)}
                  >
                    {enPausa ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5v14M16 5v14" />
                      </svg>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  className="carousel-control-prev Recientes__boton"
                  data-bs-target={`#${ID_CARRUSEL}`}
                  data-bs-slide="prev"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span className="sr-only">Charla anterior</span>
                </button>
                <button
                  type="button"
                  className="carousel-control-next Recientes__boton"
                  data-bs-target={`#${ID_CARRUSEL}`}
                  data-bs-slide="next"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  <span className="sr-only">Charla siguiente</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// memo: evita que React toque el DOM que Bootstrap está moviendo
export default memo(Recientes);
