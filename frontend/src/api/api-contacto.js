import { enviar } from './cliente';

// Envía el formulario de contacto. El backend lo reenvía por correo y no lo guarda.
export function enviarContacto(datos) {
    return enviar('/contacto', datos);
}
