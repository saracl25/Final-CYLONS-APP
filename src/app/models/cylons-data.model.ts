/**
 * Modelo: envoltorio (envelope) del archivo JSON externo.
 * Define la forma exacta de /assets/data/cylons-data.json para que
 * HttpClient devuelva datos tipados y no `any`.
 */
import { Ruta } from './ruta.model';
import { Alerta } from './alerta.model';
import { Usuario } from './usuario.model';

export interface CylonsData {
  aplicacion: string;
  version: string;
  grupo: string;
  usuario: Usuario;
  rutas: Ruta[];
  alertas: Alerta[];
}
