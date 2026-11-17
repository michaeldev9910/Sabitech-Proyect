import { Sala } from '../modelos/sala';
import { pedir } from './cliente';

export async function listarSalas() {
    const salas = await pedir('/salas');
    return salas.map(Sala.fromJSON);
}
