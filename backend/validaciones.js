/**
 * Validaciones del Back-End de CYLONS.
 * -----------------------------------------------------------------------------
 * Las reglas críticas viven AQUÍ (servidor) y no solo en el formulario Angular:
 * cualquier cliente (curl, Postman, otro front) pasa por estas comprobaciones.
 *
 * Cada función devuelve un objeto { campo: 'mensaje' }; vacío = datos válidos.
 */

const TIPOS_ALERTA = ['peatón', 'obra', 'escalón'];
const SEVERIDADES = ['baja', 'media', 'alta'];

/** Regla del dominio: solo se reportan obstáculos "cercanos" (1 a 500 m). */
const DISTANCIA_MIN = 1;
const DISTANCIA_MAX = 500;
const UBICACION_MAX = 120;

const ID_RUTA = /^r-\d{3}$/;

/** Valida el cuerpo de POST /api/alertas. */
function validarNuevaAlerta(cuerpo) {
  const errores = {};

  if (cuerpo === null || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    return { cuerpo: 'El cuerpo de la solicitud debe ser un objeto JSON.' };
  }

  // tipoAlerta: obligatorio y dentro del catálogo
  if (cuerpo.tipoAlerta === undefined || cuerpo.tipoAlerta === null || cuerpo.tipoAlerta === '') {
    errores.tipoAlerta = 'El tipo de obstáculo es obligatorio.';
  } else if (!TIPOS_ALERTA.includes(cuerpo.tipoAlerta)) {
    errores.tipoAlerta = `Tipo no válido. Valores permitidos: ${TIPOS_ALERTA.join(', ')}.`;
  }

  // severidad: obligatoria y dentro del catálogo
  if (cuerpo.severidad === undefined || cuerpo.severidad === null || cuerpo.severidad === '') {
    errores.severidad = 'La severidad es obligatoria.';
  } else if (!SEVERIDADES.includes(cuerpo.severidad)) {
    errores.severidad = `Severidad no válida. Valores permitidos: ${SEVERIDADES.join(', ')}.`;
  }

  // distanciaMetros: obligatoria, número finito y dentro del rango del dominio
  if (cuerpo.distanciaMetros === undefined || cuerpo.distanciaMetros === null || cuerpo.distanciaMetros === '') {
    errores.distanciaMetros = 'La distancia es obligatoria.';
  } else if (typeof cuerpo.distanciaMetros !== 'number' || !Number.isFinite(cuerpo.distanciaMetros)) {
    errores.distanciaMetros = 'La distancia debe ser un número.';
  } else if (cuerpo.distanciaMetros < DISTANCIA_MIN || cuerpo.distanciaMetros > DISTANCIA_MAX) {
    errores.distanciaMetros = `La distancia debe estar entre ${DISTANCIA_MIN} y ${DISTANCIA_MAX} metros.`;
  }

  // ubicacion: opcional, pero si llega debe ser texto de longitud razonable
  if (cuerpo.ubicacion !== undefined && cuerpo.ubicacion !== null) {
    if (typeof cuerpo.ubicacion !== 'string') {
      errores.ubicacion = 'La ubicación debe ser texto.';
    } else if (cuerpo.ubicacion.trim().length > UBICACION_MAX) {
      errores.ubicacion = `La ubicación no puede superar ${UBICACION_MAX} caracteres.`;
    }
  }

  return errores;
}

/** ¿El identificador de ruta tiene un formato válido (r-001)? */
function idRutaValido(id) {
  return ID_RUTA.test(id);
}

module.exports = {
  validarNuevaAlerta,
  idRutaValido,
  TIPOS_ALERTA,
  SEVERIDADES,
  DISTANCIA_MIN,
  DISTANCIA_MAX,
  UBICACION_MAX
};
