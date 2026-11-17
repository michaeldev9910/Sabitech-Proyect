const TRAZOS = {
  salud: (
    <>
      <path d="M20.8 8.6a5.4 5.4 0 0 0-9.3-3.7L12 5.4l-.5-.5a5.4 5.4 0 0 0-7.6 7.6l.5.5L12 20.6l7.6-7.6.5-.5a5.4 5.4 0 0 0 .7-3.9z" />
      <path d="M3.5 12h4l1.5-3 3 6 1.5-3h7" />
    </>
  ),
  tecnologia: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9.5 9.5h5v5h-5zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  negocios: (
    <>
      <path d="M3 20h18" />
      <path d="M6 16v-4M11 16V8M16 16v-6" />
      <path d="m4 9 5-4 4 3 7-5" />
    </>
  ),
};

/** Icono lineal de cada área de Sabitech. */
function IconoArea({ area, className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TRAZOS[area] ?? TRAZOS.tecnologia}
    </svg>
  );
}

export default IconoArea;
