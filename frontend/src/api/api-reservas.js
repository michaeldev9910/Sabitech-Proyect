import { Reserva } from '../modelos/reserva';
import { pedir } from './cliente';

export async function listarMisReservas(token) {
    const reservas = await pedir('/mis-reservas', { token });
    return reservas.map(Reserva.fromJSON);
}

export async function reservar(token, charlaId) {
    const reserva = await pedir('/reservas', {
        method: 'POST',
        token,
        body: JSON.stringify({ charla_id: charlaId }),
    });
    return Reserva.fromJSON(reserva);
}

// Devuelve { mensaje: "Reserva cancelada" }: para ver el nuevo estado, vuelve a pedir listarMisReservas()
export function cancelarReserva(token, reservaId) {
    return pedir(`/reservas/${reservaId}`, { method: 'DELETE', token });
}
