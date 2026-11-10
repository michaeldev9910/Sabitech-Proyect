import { momentoDe } from "../../utils/charlas.js";
import "./Sedes.css";

// Orden de las plantas para dibujar el edificio (de arriba abajo)
const NIVELES = [
  ["sotano", -1],
  ["baja", 0],
  ["primera", 1],
  ["segunda", 2],
  ["tercera", 3],
  ["cuarta", 4],
  ["quinta", 5],
];

const nivelDe = (ubicacion) => {
  const texto = (ubicacion ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return NIVELES.find(([palabra]) => texto.includes(palabra))?.[1] ?? 99;
};

function Sedes({ salas, charlas, cargando, onElegirSala }) {
  const vigentes = (charlas ?? []).filter((charla) => momentoDe(charla) !== "celebrada");
  const charlasEn = (sala) => vigentes.filter((charla) => charla.salaId === sala.id).length;

  // Agrupa las salas por planta
  const plantas = [];
  for (const sala of salas) {
    const nombre = sala.ubicacion || "Otras salas";
    let planta = plantas.find((grupo) => grupo.nombre === nombre);
    if (!planta) {
      planta = { nombre, nivel: nivelDe(sala.ubicacion), salas: [] };
      plantas.push(planta);
    }
    planta.salas.push(sala);
  }
  plantas.sort((a, b) => b.nivel - a.nivel);

  const capacidadTotal = salas.reduce((total, sala) => total + (sala.capacidad ?? 0), 0);

  return (
    <section id="donde-estamos" className="Sedes" aria-labelledby="sedes-titulo">
      <div className="Sedes__contenedor">
        <header className="Sedes__cabecera">
          <p className="Sedes__antetitulo">Dónde estamos</p>
          <h2 id="sedes-titulo" className="Sedes__titulo">
            Nuestros espacios
          </h2>
          <p className="Sedes__intro">
            Todas las charlas se celebran en nuestras instalaciones. Consulta en
            qué planta está cada sala, su capacidad y cuántas sesiones acoge.
          </p>

          {!cargando && salas.length > 0 && (
            <dl className="Sedes__cifras">
              <div>
                <dt>salas</dt>
                <dd>{salas.length}</dd>
              </div>
              <div>
                <dt>plantas</dt>
                <dd>{plantas.length}</dd>
              </div>
              <div>
                <dt>asientos en total</dt>
                <dd>{capacidadTotal}</dd>
              </div>
            </dl>
          )}
        </header>

        <div className="Edificio">
          {cargando && <div className="Edificio__esqueleto" aria-hidden="true" />}

          {!cargando && salas.length === 0 && (
            <p className="Edificio__vacio">La información de las salas no está disponible ahora mismo.</p>
          )}

          {plantas.map((planta) => (
            <div key={planta.nombre} className="Planta">
              <p className="Planta__nombre">{planta.nombre}</p>
              <ul className="Planta__salas">
                {planta.salas.map((sala) => {
                  const cuantas = charlasEn(sala);
                  return (
                    <li key={sala.id}>
                      <a
                        href="#charlas"
                        className="Sala"
                        onClick={() => onElegirSala(String(sala.id))}
                      >
                        <strong className="Sala__nombre">{sala.nombre}</strong>
                        <span className="Sala__dato">{sala.capacidad} plazas</span>
                        <span className="Sala__charlas" data-vacia={cuantas === 0}>
                          {cuantas === 0
                            ? "Sin charlas próximas"
                            : `${cuantas} ${cuantas === 1 ? "charla próxima" : "charlas próximas"}`}
                        </span>
                        <span className="Sala__ir" aria-hidden="true">→</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Sedes;
