import { Charla } from '../models/talk';
import { pedir } from './client';

export async function listarCharlas() {
    const charlas = await pedir('/charlas');
    return charlas.map(Charla.fromJSON);
}
