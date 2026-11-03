import { Ponente } from './Ponente';
import { Sala } from './Sala';

export class Charla {
    constructor({
        id,
        ponente_id,
        sala_id,
        titulo,
        descripcion,
        inicio,
        fin,
        apertura_plazas,
        aforo,
        estado,
        ponente,
        sala,
    }) {
        this.id = id;
        this.ponenteId = ponente_id;
        this.salaId = sala_id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.inicio = inicio;
        this.fin = fin;
        this.aperturaPlazas = apertura_plazas;
        this.aforo = aforo;
        this.estado = estado;
        this.ponente = ponente ? Ponente.fromJSON(ponente) : null;
        this.sala = sala ? Sala.fromJSON(sala) : null;
    }

    static fromJSON(json) {
        if (!json) return null;
        return new Charla({
            id: json.id,
            ponente_id: json.ponente_id,
            sala_id: json.sala_id,
            titulo: json.titulo,
            descripcion: json.descripcion,
            inicio: json.inicio,
            fin: json.fin,
            apertura_plazas: json.apertura_plazas,
            aforo: json.aforo,
            estado: json.estado,
            ponente: json.ponente,
            sala: json.sala,
        });
    }

    toJSON() {
        return {
            id: this.id,
            ponente_id: this.ponenteId,
            sala_id: this.salaId,
            titulo: this.titulo,
            descripcion: this.descripcion,
            inicio: this.inicio,
            fin: this.fin,
            apertura_plazas: this.aperturaPlazas,
            aforo: this.aforo,
            estado: this.estado,
        };
    }
}