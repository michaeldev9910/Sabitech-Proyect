import "./Contacto.css";

// TODO: sustituir por el correo real de la organización de Sabitech.
const CORREO_CONTACTO = "contacto@sabitech.es";

const VENTAJAS = [
  {
    titulo: "Ponentes en activo",
    texto: "Profesionales que aplican cada día lo que cuentan en sus charlas.",
  },
  {
    titulo: "Aforo reducido",
    texto: "Grupos pequeños para que haya tiempo de preguntar y debatir.",
  },
  {
    titulo: "Acceso con código QR",
    texto: "Reserva tu plaza y entra a la sala con tu código, sin colas.",
  },
];

function Contacto() {
  return (
    <section id="contacto" className="Contacto ZonaOscura" aria-labelledby="contacto-titulo">
      <div className="Contacto__contenedor">
        <div className="Contacto__llamada">
          <p className="Contacto__antetitulo">Contacto</p>
          <h2 id="contacto-titulo" className="Contacto__titulo">
            ¿Tienes conocimiento que compartir?
          </h2>
          <p className="Contacto__texto">
            Buscamos ponentes con experiencia real en salud, tecnología y
            negocios. Escríbenos con tu propuesta o cualquier consulta sobre el
            programa.
          </p>

          <div className="Contacto__botones">
            <a
              href={`mailto:${CORREO_CONTACTO}?subject=${encodeURIComponent("Propuesta de charla para Sabitech")}`}
              className="Contacto__boton Contacto__boton--principal"
            >
              Proponer una charla
            </a>
            <a href={`mailto:${CORREO_CONTACTO}`} className="Contacto__boton">
              {CORREO_CONTACTO}
            </a>
          </div>
        </div>

        <ul className="Contacto__ventajas">
          {VENTAJAS.map(({ titulo, texto }, indice) => (
            <li key={titulo}>
              <span className="Contacto__numero" aria-hidden="true">
                {String(indice + 1).padStart(2, "0")}
              </span>
              <div>
                <strong>{titulo}</strong>
                <p>{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Contacto;
