export class Sala {
    constructor({ id, nombre, ubicacion, capacidad }) {
        this.id = id;
        this.nombre = nombre;
        this.ubicacion = ubicacion;
        this.capacidad = capacidad;
    }

    static fromJSON(json) {
        if (!json) return null;
        return new Sala({
            id: json.id,
            nombre: json.nombre,
            ubicacion: json.ubicacion,
            capacidad: json.capacidad,
        });
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            ubicacion: this.ubicacion,
            capacidad: this.capacidad,
        };
    }
}