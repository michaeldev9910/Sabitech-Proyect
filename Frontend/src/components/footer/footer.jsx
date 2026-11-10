import "./footer.css";

function Footer() {
  const anio = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Identidad de Sabitech */}
        <div className="footer__brand">
          <a href="#" className="footer__logo">
            sabi<span>tech</span>
          </a>

          <p>
            Conectamos salud, negocios y tecnología a través del conocimiento y
            la innovación.
          </p>
        </div>

        {/* Información */}
        <div className="footer__info">
          <h3>Sobre Sabitech</h3>

          <p>
            Un espacio para compartir conocimientos, descubrir nuevas ideas y
            conectar profesionales.
          </p>
        </div>

        {/* Llamada a la acción */}
        <div className="footer__action">
          <h3>Participa en nuestras charlas</h3>

          <p>Descubre los próximos eventos y reserva tu plaza.</p>

          <a href="#charlas">
            Consultar charlas
            <span aria-hidden="true"> →</span>
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer__bottom">
        <p>© {anio} Sabitech. Todos los derechos reservados.</p>

        <p>
          Desarrollado por
          <strong> Michael, Héctor y Karim</strong>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
