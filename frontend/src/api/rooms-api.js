import { Sala } from '../models/room';
import { pedir } from './client';

export async function listarSalas() {
    const salas = await pedir('/salas');
    return salas.map(Sala.fromJSON);
}
