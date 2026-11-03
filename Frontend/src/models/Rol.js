export class Rol {
    constructor({ id, codigo, nombre, descripcion }) {
        this.id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.descripcion = descripcion;
    }


    static fromJson(json) {
        if (!json) return null;
        return new Roles({
            id: json.id,
            codigo: json.codigo,
            nombre: json.nombre,
            descripcion: json.descripcion
        });
    }

    toJson() {
        return {
            id: this.id,
            codigo: this.codigo,
            nombre: this.nombre,
            descripcion: this.descripcion
        }
    }
}