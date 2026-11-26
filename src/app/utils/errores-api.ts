/**
 * Traduce un HttpErrorResponse a un error comprensible para el usuario.
 * Permite diferenciar en la interfaz: sin conexión, datos inválidos,
 * información inexistente y fallo del servidor (no basta con la consola).
 */
import { HttpErrorResponse } from '@angular/common/http';

export type TipoErrorApi = 'red' | 'validacion' | 'no-encontrado' | 'servidor';

export interface ErrorApi {
  tipo: TipoErrorApi;
  mensaje: string;
  /** Errores por campo devueltos por el back-end (400). */
  errores?: Record<string, string>;
}

interface CuerpoError {
  mensaje?: string;
  errores?: Record<string, string>;
}

const MENSAJE_SIN_SERVIDOR =
  'No se pudo comunicar con el servidor de CYLONS. Verifica que el back-end esté encendido (npm run api) e inténtalo de nuevo.';

export function describirError(err: unknown): ErrorApi {
  if (!(err instanceof HttpErrorResponse)) {
    return { tipo: 'servidor', mensaje: 'Ocurrió un error inesperado. Inténtalo de nuevo.' };
  }

  const cuerpo = (err.error ?? null) as CuerpoError | null;
  const mensajeApi = typeof cuerpo?.mensaje === 'string' ? cuerpo.mensaje : undefined;

  // Sin respuesta, o error del proxy de desarrollo cuando el back-end está apagado
  if (err.status === 0 || (err.status >= 500 && !mensajeApi)) {
    return { tipo: 'red', mensaje: MENSAJE_SIN_SERVIDOR };
  }

  if (err.status === 400) {
    return {
      tipo: 'validacion',
      mensaje: mensajeApi ?? 'Los datos enviados no son válidos.',
      errores: cuerpo?.errores
    };
  }

  if (err.status === 404) {
    return { tipo: 'no-encontrado', mensaje: mensajeApi ?? 'La información solicitada no existe.' };
  }

  return { tipo: 'servidor', mensaje: mensajeApi ?? 'El servidor no pudo completar la operación.' };
}
