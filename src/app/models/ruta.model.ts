/**
 * Modelo: Ruta
 * Entidad principal de CYLONS: un trayecto urbano seguro hacia un destino.
 * Los tipos de unión (union types) restringen los valores válidos y hacen
 * imposible representar niveles de accesibilidad inexistentes.
 */

export type NivelAccesibilidad = 'alta' | 'media' | 'baja';

export interface Ruta {
  id: string;
  /** Destino final del trayecto (ej. "Universidad Lasallista"). */
  nombreDestino: string;
  /** Longitud del recorrido en kilómetros. */
  distanciaKm: number;
  /** Tiempo estimado de llegada en minutos. */
  tiempoEstimado: number;
  /** Qué tan apta es la ruta para una persona con discapacidad visual. */
  nivelAccesibilidad: NivelAccesibilidad;
  /** Nota breve para el usuario (opcional). */
  descripcion?: string;
}
