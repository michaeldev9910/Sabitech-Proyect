import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../componentes/cabecera/cabecera.jsx";
import Footer from "../../componentes/pie/pie.jsx";
import TarjetaReserva from "../../componentes/tarjeta-reserva/tarjeta-reserva.jsx";
import { cancelarReserva, listarMisReservas } from "../../api/api-reservas.js";
import { ApiError } from "../../api/error-api.js";
import { momentoDe } from "../../utilidades/charlas.js";
import "./my-bookings-view.css";

const fechaDe = (reserva) => new Date(reserva.charla?.inicio ?? 0).getTime();

// Próximas: confirmadas y sin terminar. El resto (celebradas o canceladas) va aparte.
const esProxima = (reserva) =>
  reserva.estado === "confirmada" &&
  Boolean(reserva.charla) &&
  momentoDe(reserva.charla) !== "celebrada";

function ListaReservas({ id, titulo, reservas, onCancelar }) {
  return (
    <section className="MisReservas__seccion" aria-labelledby={id}>
      <h2 id={id} className="MisReservas__subtitulo">
        {titulo}
        <span className="MisReservas__cuenta">{reservas.length}</span>
      </h2>
      <ul className="MisReservas__lista">
        {reservas.map((reserva) => (
          <li key={reserva.id}>
            <TarjetaReserva reserva={reserva} onCancelar={onCancelar} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * "Mis reservas": las plazas de la persona con sesión, separadas en
 * próximas y pasadas o canceladas. Desde aquí se cancela una reserva.
 */
function MyBookingsView({ usuario, token, onCerrarSesion, onVolverAInicio }) {
  const [reservas, setReservas] = useState(null);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const avisoRef = useRef(null);

  useEffect(() => {
    let cancelado = false;

    listarMisReservas(token)
      .then((lista) => {
        if (!cancelado) setReservas(lista);
      })
      .catch((errorPeticion) => {
        console.error("Error al listar mis reservas:", errorPeticion);
        if (!cancelado) {
          setError(
            "No se han podido cargar tus reservas. Comprueba tu conexión y vuelve a intentarlo.",
          );
        }
      });

    return () => {
      cancelado = true;
    };
  }, [token]);

  // Cualquier enlace a una sección (#charlas, #contacto… de la cabecera o el pie)
  // lleva de vuelta a la página principal
  useEffect(() => {
    window.addEventListener("hashchange", onVolverAInicio);
    return () => window.removeEventListener("hashchange", onVolverAInicio);
  }, [onVolverAInicio]);

  // Tras cancelar, la tarjeta cambia de lista: el foco pasa al aviso para no perderlo
  useEffect(() => {
    if (aviso) avisoRef.current?.focus();
  }, [aviso]);

  async function cancelar(reserva) {
    try {
      await cancelarReserva(token, reserva.id);
    } catch (errorPeticion) {
      // 409/422/404: la reserva ha cambiado en el servidor; se refresca la lista
      if (errorPeticion instanceof ApiError && errorPeticion.status !== 401) {
        listarMisReservas(token).then(setReservas).catch(console.error);
      }
      throw errorPeticion;
    }

    setReservas((lista) =>
      lista.map((otra) => (otra.id === reserva.id ? { ...otra, estado: "cancelada" } : otra)),
    );
    setAviso(`Has cancelado tu reserva de «${reserva.charla?.titulo ?? "la charla"}».`);

    listarMisReservas(token)
      .then(setReservas)
      .catch((errorPeticion) => {
        console.error("No se pudo refrescar la lista tras cancelar:", errorPeticion);
      });
  }

  const { proximas, pasadas } = useMemo(() => {
    const lista = reservas ?? [];
    return {
      proximas: lista.filter(esProxima).sort((a, b) => fechaDe(a) - fechaDe(b)),
      // Las pasadas, de la más reciente a la más antigua
      pasadas: lista.filter((reserva) => !esProxima(reserva)).sort((a, b) => fechaDe(b) - fechaDe(a)),
    };
  }, [reservas]);

  const cargando = reservas === null && !error;
  const vacia = reservas?.length === 0;

  return (
    <>
      <Header
        usuario={usuario}
        onCerrarSesion={onCerrarSesion}
        onVerMisReservas={() => window.scrollTo({ top: 0 })}
        seccionActual="mis-reservas"
      />

      <main className="MisReservas" aria-labelledby="mis-reservas-titulo">
        <div className="MisReservas__contenedor">
          <header className="MisReservas__cabecera">
            <p className="MisReservas__antetitulo">Tu cuenta</p>
            <h1 id="mis-reservas-titulo" className="MisReservas__titulo">
              Mis reservas
            </h1>
            <p className="MisReservas__intro">
              Consulta tus plazas y tu código de reserva. Si no puedes asistir,
              cancela la reserva para que otra persona pueda ocupar tu sitio.
            </p>
            <a href="#charlas" className="MisReservas__volver">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              Volver al programa
            </a>
          </header>

          {aviso && (
            <p ref={avisoRef} tabIndex={-1} className="MisReservas__aviso" role="status">
              {aviso}
            </p>
          )}

          {error && (
            <p className="MisReservas__aviso MisReservas__aviso--error" role="alert">
              {error}
            </p>
          )}

          {cargando && (
            <p className="MisReservas__cargando" role="status">
              Cargando tus reservas…
            </p>
          )}

          {vacia && (
            <div className="MisReservas__vacio">
              <p className="MisReservas__vacio-titulo">Todavía no tienes reservas</p>
              <p>Elige una charla del programa y reserva tu plaza.</p>
              <a href="#charlas" className="MisReservas__boton">
                Ver el programa
              </a>
            </div>
          )}

          {proximas.length > 0 && (
            <ListaReservas
              id="reservas-proximas"
              titulo="Próximas"
              reservas={proximas}
              onCancelar={cancelar}
            />
          )}

          {pasadas.length > 0 && (
            <ListaReservas
              id="reservas-pasadas"
              titulo="Pasadas o canceladas"
              reservas={pasadas}
              onCancelar={cancelar}
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default MyBookingsView;
