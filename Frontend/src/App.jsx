import { useEffect, useState } from "react";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/footer/footer.jsx";
import { listarCharlas } from "./api/charlasApi.js";
import "./App.css";

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function App() {
  const [charlas, setCharlas] = useState(null);
  const [hayError, setHayError] = useState(false);
  const [visibles, setVisibles] = useState(false);

  useEffect(() => {
    listarCharlas()
      .then((charlas) => {
        console.log("Charlas:", charlas);
        setCharlas(charlas);
      })
      .catch((error) => {
        console.error("Error al listar charlas:", error);
        setHayError(true);
      });
  }, []);

  return (
    <>
      <Header />

      <main>
        <section id="charlas" className="Charlas">
          <button
            type="button"
            className="BotonCharlas"
            aria-expanded={visibles}
            onClick={() => setVisibles((valor) => !valor)}
          >
            {visibles ? "Ocultar charlas" : "Ver charlas"}
          </button>

          {visibles && (
            <>
              {hayError && (
                <p role="alert">
                  No se han podido cargar las charlas. Recarga la página para
                  volver a intentarlo.
                </p>
              )}
              {!hayError && charlas === null && <p>Cargando charlas…</p>}
              {charlas?.length === 0 && (
                <p>Todavía no hay charlas publicadas.</p>
              )}
              {charlas?.length > 0 && (
                <ul className="ListaCharlas">
                  {charlas.map((charla) => (
                    <li key={charla.id} className="TarjetaCharla">
                      <h2>{charla.titulo}</h2>
                      {charla.descripcion && <p>{charla.descripcion}</p>}
                      <dl>
                        <dt>Horario</dt>
                        <dd>
                          {formatoFecha.formatRange(
                            new Date(charla.inicio),
                            new Date(charla.fin),
                          )}
                        </dd>
                        {charla.ponente && (
                          <>
                            <dt>Ponente</dt>
                            <dd>
                              {charla.ponente.nombre} {charla.ponente.apellidos}
                              {charla.ponente.organizacion &&
                                ` · ${charla.ponente.organizacion}`}
                            </dd>
                          </>
                        )}
                        {charla.sala && (
                          <>
                            <dt>Sala</dt>
                            <dd>
                              {charla.sala.nombre}
                              {charla.sala.ubicacion &&
                                ` · ${charla.sala.ubicacion}`}
                            </dd>
                          </>
                        )}
                        <dt>Aforo</dt>
                        <dd>{charla.aforo} plazas</dd>
                        <dt>Reservas desde</dt>
                        <dd>
                          {formatoFecha.format(new Date(charla.aperturaPlazas))}
                        </dd>
                      </dl>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default App;
