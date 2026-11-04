export class Rol {
  constructor({ id, codigo, nombre, descripcion }) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.descripcion = descripcion;
  }

  static fromJSON(json) {
    if (!json) return null;
    return new Rol({
      id: json.id,
      codigo: json.codigo,
      nombre: json.nombre,
      descripcion: json.descripcion,
    });
  }

  toJSON() {
    return {
      id: this.id,
      codigo: this.codigo,
      nombre: this.nombre,
      descripcion: this.descripcion,
    };
  }
}
