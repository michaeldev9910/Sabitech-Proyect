import { Reserva } from './Reserva';

export class Notificacion {
    constructor({
        id,
        reserva_id,
        destinatario,
        asunto,
        estado,
        intentos,
        ultimo_error,
        enviada_en,
        reserva,
    }) {
        this.id = id;
        this.reservaId = reserva_id;
        this.destinatario = destinatario;
        this.asunto = asunto;
        this.estado = estado;
        this.intentos = intentos;
        this.ultimoError = ultimo_error;
        this.enviadaEn = enviada_en;
        this.reserva = reserva ? Reserva.fromJSON(reserva) : null;
    }

    static fromJSON(json) {
        if (!json) return null;
        return new Notificacion({
            id: json.id,
            reserva_id: json.reserva_id,
            destinatario: json.destinatario,
            asunto: json.asunto,
            estado: json.estado,
            intentos: json.intentos,
            ultimo_error: json.ultimo_error,
            enviada_en: json.enviada_en,
            reserva: json.reserva,
        });
    }

    toJSON() {
        return {
            id: this.id,
            reserva_id: this.reservaId,
            destinatario: this.destinatario,
            asunto: this.asunto,
            estado: this.estado,
            intentos: this.intentos,
            ultimo_error: this.ultimoError,
            enviada_en: this.enviadaEn,
        };
    }
}