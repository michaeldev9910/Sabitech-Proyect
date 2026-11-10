import { useState } from "react";
import { iniciales, nombreCompleto } from "../../utils/charlas.js";
import "./Retrato.css";

/**
 * Foto del ponente. Si no tiene foto (o falla al cargar) se genera un
 * retrato con sus iniciales en el color de su área.
 */
function Retrato({ ponente, area, className = "" }) {
  const [fallo, setFallo] = useState(false);
  const foto = ponente?.fotoUrl;

  return (
    <div className={`Retrato ${className}`} data-area={area}>
      {foto && !fallo ? (
        <img
          src={foto}
          alt={`Foto de ${nombreCompleto(ponente)}`}
          loading="lazy"
          decoding="async"
          onError={() => setFallo(true)}
        />
      ) : (
        <div className="Retrato__generado" aria-hidden="true">
          <svg className="Retrato__anillos" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
            <circle cx="150" cy="40" r="30" />
            <circle cx="150" cy="40" r="60" />
            <circle cx="150" cy="40" r="90" />
            <circle cx="150" cy="40" r="120" />
          </svg>
          <span className="Retrato__iniciales">{iniciales(ponente)}</span>
        </div>
      )}
    </div>
  );
}

export default Retrato;
