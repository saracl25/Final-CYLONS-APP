/**
 * Modelo: Alerta / Obstáculo
 * Representa un obstáculo detectado o reportado en el entorno del usuario.
 */

/** Tipos de obstáculo que CYLONS puede anunciar por voz. */
export type TipoAlerta = 'peatón' | 'obra' | 'escalón';

/** Gravedad del obstáculo: define el color y la prioridad del aviso. */
export type Severidad = 'baja' | 'media' | 'alta';

export interface Alerta {
  id: string;
  tipoAlerta: TipoAlerta;
  /** Distancia aproximada al obstáculo, en metros. */
  distanciaMetros: number;
  severidad: Severidad;
  /** Ubicación textual (opcional) para dar contexto al usuario. */
  ubicacion?: string;
  /** Fecha de creación (la asigna el servidor al guardar un reporte). */
  creadaEn?: string;
}

/** Cuerpo de POST /api/alertas: lo que el usuario captura en el formulario. */
export interface NuevaAlerta {
  tipoAlerta: TipoAlerta;
  distanciaMetros: number;
  severidad: Severidad;
  ubicacion?: string;
}
