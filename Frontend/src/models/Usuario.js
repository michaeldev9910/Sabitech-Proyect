import { Rol } from './Rol';

export class Usuario {
    constructor({ id, rol_id, nombre, apellidos, email, activo, rol }) {
        this.id = id;
        this.rolId = rol_id;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.email = email;
        this.activo = Boolean(activo);
        this.rol = rol ? Rol.fromJSON(rol) : null;
    }

    static fromJSON(json) {
        if (!json) return null;
        return new Usuario({
            id: json.id,
            rol_id: json.rol_id,
            nombre: json.nombre,
            apellidos: json.apellidos,
            email: json.email,
            activo: json.activo,
            rol: json.rol,
        });
    }

    toJSON() {
        return {
            id: this.id,
            rol_id: this.rolId,
            nombre: this.nombre,
            apellidos: this.apellidos,
            email: this.email,
            activo: this.activo,
        };
    }
}