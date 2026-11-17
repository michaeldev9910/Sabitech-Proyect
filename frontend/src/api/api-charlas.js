import { Charla } from '../modelos/charla';
import { pedir } from './cliente';

export async function listarCharlas() {
    const charlas = await pedir('/charlas');
    return charlas.map(Charla.fromJSON);
}
