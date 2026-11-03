import { Reserva } from './Reserva';
import { Usuario } from './Usuario';

export class Asistencia {
    constructor({
        id,
        reserva_id,
        registrada_por,
        qr_ventana,
        registrada_en,
        reserva,
        registrada_por_usuario,
    }) {
        this.id = id;
        this.reservaId = reserva_id;
        this.registradaPor = registrada_por;
        this.qrVentana = qr_ventana;
        this.registradaEn = registrada_en;
        this.reserva = reserva ? Reserva.fromJSON(reserva) : null;
        this.registradaPorUsuario = registrada_por_usuario ? Usuario.fromJSON(registrada_por_usuario) : null;
    }

    static fromJSON(json) {
        if (!json) return null;
        return new Asistencia({
            id: json.id,
            reserva_id: json.reserva_id,
            registrada_por: json.registrada_por,
            qr_ventana: json.qr_ventana,
            registrada_en: json.registrada_en,
            reserva: json.reserva,
            registrada_por_usuario: json.registrada_por_usuario,
        });
    }

    toJSON() {
        return {
            id: this.id,
            reserva_id: this.reservaId,
            registrada_por: this.registradaPor,
            qr_ventana: this.qrVentana,
            registrada_en: this.registradaEn,
        };
    }
}