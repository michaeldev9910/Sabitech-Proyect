import { Ponente } from './ponente';
import { Sala } from './sala';

export class Charla {
    constructor({
        id,
        sala_id,
        titulo,
        descripcion,
        inicio,
        fin,
        apertura_plazas,
        aforo,
        estado,
        categoria,
        plazas_libres,
        reservas_confirmadas_count,
        ponentes,
        sala,
    }) {
        this.id = id;
        this.salaId = sala_id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.inicio = inicio;
        this.fin = fin;
        this.aperturaPlazas = apertura_plazas;
        this.aforo = aforo;
        this.estado = estado;
        // La API aún no tiene categoría: si algún día la envía, se usa; si no, se deduce en el front.
        this.categoria = categoria ?? null;
        this.plazasLibres = plazas_libres ?? null;
        this.reservasConfirmadas = reservas_confirmadas_count ?? null;
        // Una charla puede tener varios ponentes: siempre es un array (el "pivot" de cada uno se ignora)
        this.ponentes = (ponentes ?? []).map(Ponente.fromJSON).filter(Boolean);
        this.sala = sala ? Sala.fromJSON(sala) : null;
    }

    static fromJSON(json) {
        if (!json) return null;
        return new Charla({
            id: json.id,
            sala_id: json.sala_id,
            titulo: json.titulo,
            descripcion: json.descripcion,
            inicio: json.inicio,
            fin: json.fin,
            apertura_plazas: json.apertura_plazas,
            aforo: json.aforo,
            estado: json.estado,
            categoria: json.categoria,
            plazas_libres: json.plazas_libres,
            reservas_confirmadas_count: json.reservas_confirmadas_count,
            ponentes: json.ponentes,
            sala: json.sala,
        });
    }

    toJSON() {
        return {
            id: this.id,
            sala_id: this.salaId,
            titulo: this.titulo,
            descripcion: this.descripcion,
            inicio: this.inicio,
            fin: this.fin,
            apertura_plazas: this.aperturaPlazas,
            aforo: this.aforo,
            estado: this.estado,
            // Al crear o editar una charla el backend espera los ids de los ponentes
            ponentes: this.ponentes.map((ponente) => ponente.id),
        };
    }
}
