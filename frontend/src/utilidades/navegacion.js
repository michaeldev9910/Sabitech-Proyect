/** Lleva al buscador del programa y le pone el foco. */
export function irAlBuscador() {
  const campo = document.getElementById("buscar-charlas");
  if (!campo) {
    // En otra vista (p. ej. "Mis reservas") no hay buscador: se vuelve al programa
    window.location.hash = "charlas";
    return;
  }
  campo.scrollIntoView({ block: "center" });
  campo.focus({ preventScroll: true });
}
