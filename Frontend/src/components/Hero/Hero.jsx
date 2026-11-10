import { useEffect, useState } from "react";
import IconoArea from "../IconoArea/IconoArea.jsx";
import Retrato from "../Retrato/Retrato.jsx";
import { CATEGORIAS, categoriaPorId } from "../../utils/categorias.js";
import {
  formatoFechaLarga,
  horario,
  momentoDe,
  nombreCompleto,
  siguienteCharla,
} from "../../utils/charlas.js";
import { irAlBuscador } from "../../utils/navegacion.js";
import "./Hero.css";

const UN_MINUTO = 60_000;

function CuentaAtras({ hasta }) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const temporizador = setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(temporizador);
  }, []);

  const restante = Math.max(0, new Date(hasta).getTime() - ahora);
  const minutos = Math.floor(restante / UN_MINUTO);
  const partes = [
    { valor: Math.floor(minutos / 1440), unidad: "días" },
    { valor: Math.floor((minutos % 1440) / 60), unidad: "horas" },
    { valor: minutos % 60, unidad: "min" },
  ];

  return (
    <div className="CuentaAtras" role="timer" aria-label="Tiempo restante para la charla">
      {partes.map(({ valor, unidad }) => (
        <div key={unidad} className="CuentaAtras__bloque">
          <strong>{String(valor).padStart(2, "0")}</strong>
          <span>{unidad}</span>
        </div>
      ))}
    </div>
  );
}

function ProximaCharla({ charla, area }) {
  const enDirecto = momentoDe(charla) === "en-curso";
  const categoria = categoriaPorId(area);

  return (
    <article className="Proxima" data-area={area}>
      <header className="Proxima__cabecera">
        <span className={`Proxima__estado ${enDirecto ? "Proxima__estado--directo" : ""}`}>
          {enDirecto ? "En directo ahora" : "Próxima charla"}
        </span>
        <span className="Etiqueta">{categoria.nombre}</span>
      </header>

      <h2 className="Proxima__titulo">{charla.titulo}</h2>

      <div className="Proxima__ponente">
        <Retrato ponente={charla.ponente} area={area} className="Proxima__foto" />
        <div>
          <strong>{nombreCompleto(charla.ponente)}</strong>
          {charla.ponente?.organizacion && <span>{charla.ponente.organizacion}</span>}
        </div>
      </div>

      <p className="Proxima__cuando">
        <span>{formatoFechaLarga.format(new Date(charla.inicio))}</span>
        <span>{horario(charla)}</span>
        {charla.sala && <span>{charla.sala.nombre}</span>}
      </p>

      {!enDirecto && <CuentaAtras hasta={charla.inicio} />}
    </article>
  );
}

function Hero({ charlas, areaDe, cargando, onElegirArea }) {
  const lista = charlas ?? [];
  const vigentes = lista.filter((charla) => momentoDe(charla) !== "celebrada");
  const siguiente = siguienteCharla(lista);

  const ponentes = new Set(lista.map((charla) => charla.ponenteId)).size;
  const salas = new Set(lista.map((charla) => charla.salaId)).size;
  const plazas = vigentes.reduce(
    (total, charla) => total + (charla.plazasLibres ?? charla.aforo ?? 0),
    0,
  );

  const cifras = [
    { valor: vigentes.length, texto: "charlas programadas" },
    { valor: ponentes, texto: "ponentes expertos" },
    { valor: plazas, texto: "plazas disponibles" },
    { valor: salas, texto: "salas" },
  ];

  // Igual que el programa por defecto: solo charlas próximas o en curso
  const porArea = (id) => vigentes.filter((charla) => areaDe.get(charla.id) === id).length;

  return (
    <section id="inicio" className="Hero" aria-labelledby="hero-titulo">
      <div className="Hero__fondo" aria-hidden="true">
        <span className="Hero__brillo Hero__brillo--salud" />
        <span className="Hero__brillo Hero__brillo--tecnologia" />
        <span className="Hero__brillo Hero__brillo--negocios" />
      </div>

      <div className="Hero__contenido">
        <div className="Hero__texto">
          <p className="Hero__antetitulo">
            <span className="Hero__punto" aria-hidden="true" />
            Ciclo de charlas profesionales
          </p>

          <h1 id="hero-titulo" className="Hero__titulo">
            Donde la <em data-area="salud">salud</em>, la{" "}
            <em data-area="tecnologia">tecnología</em> y los{" "}
            <em data-area="negocios">negocios</em> se encuentran.
          </h1>

          <p className="Hero__subtitulo">
            Sesiones impartidas por especialistas en activo. Consulta el
            programa, conoce a los ponentes y reserva tu plaza en segundos.
          </p>

          <div className="Hero__botones">
            <a href="#charlas" className="Hero__boton Hero__boton--principal">
              Explorar el programa
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <button type="button" className="Hero__boton Hero__boton--secundario" onClick={irAlBuscador}>
              Buscar por tema o ponente
            </button>
          </div>

          <dl className="Hero__cifras">
            {cifras.map(({ valor, texto }) => (
              <div key={texto}>
                <dt>{texto}</dt>
                <dd>{cargando ? "—" : valor}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="Hero__lateral">
          {cargando && <div className="Proxima Proxima--cargando" aria-hidden="true" />}
          {!cargando && siguiente && (
            <ProximaCharla charla={siguiente} area={areaDe.get(siguiente.id)} />
          )}
          {!cargando && !siguiente && (
            <div className="Proxima Proxima--vacia">
              <p>Muy pronto anunciaremos nuevas charlas.</p>
            </div>
          )}
        </div>
      </div>

      <nav className="Areas" aria-label="Explorar por área">
        {CATEGORIAS.map((categoria) => (
          <a
            key={categoria.id}
            href="#charlas"
            className="Areas__tarjeta"
            data-area={categoria.id}
            onClick={() => onElegirArea(categoria.id)}
          >
            <span className="Areas__icono">
              <IconoArea area={categoria.id} />
            </span>
            <span className="Areas__texto">
              <strong>{categoria.nombre}</strong>
              <span>{categoria.descripcion}</span>
            </span>
            <span className="Areas__cuenta">
              {cargando ? "—" : porArea(categoria.id)}
              <span className="sr-only"> charlas</span>
            </span>
          </a>
        ))}
      </nav>
    </section>
  );
}

export default Hero;
