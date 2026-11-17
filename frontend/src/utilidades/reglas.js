// =================================
// Reglas de negocio que el frontend refleja.
// Quien manda es el servidor: aquí solo sirven para no enseñar
// botones que van a fallar y para explicar por qué.
// =================================

export const HORAS_LIMITE_CANCELAR = 24; // se puede cancelar hasta 24 h antes del inicio
export const MINUTOS_APERTURA_QR = 30; // el QR estará disponible 30 min antes del inicio
export const ROLES_QUE_RESERVAN = ["asistente", "organizacion"];
