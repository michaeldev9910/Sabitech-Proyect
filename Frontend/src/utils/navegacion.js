/** Lleva al buscador del programa y le pone el foco. */
export function irAlBuscador() {
  const campo = document.getElementById("buscar-charlas");
  if (!campo) return;
  campo.scrollIntoView({ block: "center" });
  campo.focus({ preventScroll: true });
}
