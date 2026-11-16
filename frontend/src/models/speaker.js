export class Ponente {
    constructor({ id, nombre, apellidos, organizacion, biografia, foto_url }) {
        this.id = id;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.organizacion = organizacion;
        this.biografia = biografia;
        this.fotoUrl = foto_url;
    }

    static fromJSON(json) {
        if (!json) return null;
        return new Ponente({
            id: json.id,
            nombre: json.nombre,
            apellidos: json.apellidos,
            organizacion: json.organizacion,
            biografia: json.biografia,
            foto_url: json.foto_url,
        });
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            apellidos: this.apellidos,
            organizacion: this.organizacion,
            biografia: this.biografia,
            foto_url: this.fotoUrl,
        };
    }
}