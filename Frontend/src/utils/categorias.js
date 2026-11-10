// =================================
// Áreas de Sabitech: Salud · Tecnología · Negocios
//
// La API todavía no guarda la categoría de cada charla. Mientras tanto la
// deducimos aquí a partir del título, la descripción y la biografía del
// ponente. Si el back añade un campo `categoria` ("salud", "tecnologia" o
// "negocios"), se usa ese valor y esta deducción deja de aplicarse.
// =================================

export const CATEGORIAS = [
  {
    id: "salud",
    nombre: "Salud",
    descripcion: "Medicina, salud digital y bienestar",
    raices: [
      "salud", "medic", "clinic", "hospital", "pacient", "sanitari", "enfermer",
      "farmac", "biotec", "bienestar", "nutric", "psicolog", "terapi",
      "diagnost", "telemedic", "genom", "epidemi", "cirug", "quirurg",
      "cardio", "oncolog", "neuro", "fisioter", "vacun", "wellness", "health",
    ],
  },
  {
    id: "tecnologia",
    nombre: "Tecnología",
    descripcion: "Software, datos, IA e infraestructura",
    raices: [
      "tecnolog", "software", "desarroll", "programa", "codigo", "api",
      "web", "react", "laravel", "docker", "contenedor", "cloud", "nube",
      "datos", "data", "ia", "inteligencia artificial", "machine learning",
      "ciberseg", "seguridad", "devops", "frontend", "backend", "accesib",
      "interfa", "ux", "testing", "javascript", "typescript", "php", "python",
      "blockchain", "iot", "despliegue", "plataforma", "algoritm", "qr",
    ],
  },
  {
    id: "negocios",
    nombre: "Negocios",
    descripcion: "Estrategia, gestión y emprendimiento",
    raices: [
      "negocio", "empresa", "emprend", "startup", "marketing", "venta",
      "finanz", "inversi", "estrategi", "lideraz", "gestion", "management",
      "business", "comercial", "cliente", "mercado", "econom", "rrhh",
      "talento", "branding", "kpi", "rentabil", "innovacion", "direccion",
    ],
  },
];

const POR_ID = new Map(CATEGORIAS.map((categoria) => [categoria.id, categoria]));

// Si no hay ninguna pista, Sabitech nace como evento tecnológico.
const POR_DEFECTO = "tecnologia";

const normalizar = (texto) =>
  (texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const escapar = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Cada raíz debe empezar una palabra: "ia" encaja en "IA", no en "media".
const PATRONES = CATEGORIAS.map(({ id, raices }) => ({
  id,
  patrones: raices.map((raiz) => new RegExp(`(^|[^a-z0-9])${escapar(raiz)}`, "g")),
}));

const puntuar = (texto, patrones) =>
  patrones.reduce((total, patron) => total + (texto.match(patron)?.length ?? 0), 0);

/** Devuelve el id de categoría de una charla ("salud" | "tecnologia" | "negocios"). */
export function categoriaDe(charla) {
  const declarada = normalizar(charla.categoria);
  if (POR_ID.has(declarada)) return declarada;

  // El título pesa el doble: es lo que mejor describe la charla.
  const titulo = normalizar(charla.titulo);
  const resto = normalizar(
    [charla.descripcion, charla.ponente?.biografia, charla.ponente?.organizacion].join(" "),
  );

  let mejor = POR_DEFECTO;
  let mejorPuntos = 0;

  for (const { id, patrones } of PATRONES) {
    const puntos = puntuar(titulo, patrones) * 2 + puntuar(resto, patrones);
    if (puntos > mejorPuntos) {
      mejor = id;
      mejorPuntos = puntos;
    }
  }

  return mejor;
}

export const categoriaPorId = (id) => POR_ID.get(id) ?? POR_ID.get(POR_DEFECTO);
