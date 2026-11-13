import "./Sedes.css";

// Si cambia la sede, basta con tocar esta dirección: el mapa y el enlace la usan
const DIRECCION = "Calle San Vicente Mártir, 148, 46007 Valencia";
const BUSQUEDA = encodeURIComponent(DIRECCION);
const URL_MAPA = `https://www.google.com/maps?q=${BUSQUEDA}&output=embed`;
const URL_COMO_LLEGAR = `https://www.google.com/maps/dir/?api=1&destination=${BUSQUEDA}`;

function Sedes() {
  return (
    <section id="donde-estamos" className="Sedes" aria-labelledby="sedes-titulo">
      <div className="Sedes__contenedor">
        <div className="Sedes__info">
          <p className="Sedes__antetitulo">Dónde estamos</p>
          <h2 id="sedes-titulo" className="Sedes__titulo">
            En el centro de Valencia
          </h2>
          <p className="Sedes__intro">
            Todas las charlas se celebran en XTART, el centro de Formación
            Profesional del Grupo UAX con ciclos de Salud y de Business & Tech:
            las mismas áreas que recorren nuestras charlas.
          </p>

          <address className="Sedes__direccion">
            <strong>XTART FP Valencia</strong>
            <span>C/ San Vicente Mártir, 148</span>
            <span>46007 Valencia</span>
          </address>

          <a
            href={URL_COMO_LLEGAR}
            className="Sedes__enlace"
            target="_blank"
            rel="noreferrer"
          >
            Cómo llegar
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="Sedes__mapa">
          <iframe
            title="Mapa con la ubicación de XTART en Valencia"
            src={URL_MAPA}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export default Sedes;
