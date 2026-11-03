import { Usuario } from './Usuario';
import { Charla } from './Charla';

export class Reserva {
    constructor({
        id,
        codigo,
        usuario_id,
        charla_id,
        estado,
        confirmada_en,
        cancelada_en,
        qr_semilla,
        qr_renovado_en,
        usuario,
        charla,
    }) {
        this.id = id;
        this.codigo = codigo;
        this.usuarioId = usuario_id;
        this.charlaId = charla_id;
        this.estado = estado;
        this.confirmadaEn = confirmada_en;
        this.canceladaEn = cancelada_en;
        this.qrSemilla = qr_semilla;
        this.qrRenovadoEn = qr_renovado_en;
        this.usuario = usuario ? Usuario.fromJSON(usuario) : null;
        this.charla = charla ? Charla.fromJSON(charla) : null;
    }

    static fromJSON(json) {
        if (!json) return null;
        return new Reserva({
            id: json.id,
            codigo: json.codigo,
            usuario_id: json.usuario_id,
            charla_id: json.charla_id,
            estado: json.estado,
            confirmada_en: json.confirmada_en,
            cancelada_en: json.cancelada_en,
            qr_semilla: json.qr_semilla,
            qr_renovado_en: json.qr_renovado_en,
            usuario: json.usuario,
            charla: json.charla,
        });
    }

    toJSON() {
        return {
            id: this.id,
            codigo: this.codigo,
            usuario_id: this.usuarioId,
            charla_id: this.charlaId,
            estado: this.estado,
            confirmada_en: this.confirmadaEn,
            cancelada_en: this.canceladaEn,
            qr_semilla: this.qrSemilla,
            qr_renovado_en: this.qrRenovadoEn,
        };
    }
}