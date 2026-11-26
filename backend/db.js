/**
 * Persistencia de CYLONS (archivo JSON).
 * -----------------------------------------------------------------------------
 * Mecanismo elegido: un archivo JSON en disco (backend/data/db.json).
 *  - La primera vez que arranca el servidor se crea a partir de db.seed.json.
 *  - Cada alerta reportada por el usuario se escribe en el archivo, por lo que
 *    sobrevive a recargas del navegador y a reinicios del servidor.
 *  - La escritura es atómica (archivo temporal + rename) para no dejar el JSON
 *    a medias si el proceso se interrumpe.
 *
 * Para volver al estado inicial: `npm run api:reset`.
 */
const fs = require('fs');
const path = require('path');

const DIR_DATOS = path.join(__dirname, 'data');
const ARCHIVO_DB = process.env.CYLONS_DB || path.join(DIR_DATOS, 'db.json');
const ARCHIVO_SEED = path.join(DIR_DATOS, 'db.seed.json');

/** Crea db.json desde la semilla si todavía no existe. */
function inicializar() {
  if (!fs.existsSync(ARCHIVO_DB)) {
    fs.mkdirSync(path.dirname(ARCHIVO_DB), { recursive: true });
    fs.copyFileSync(ARCHIVO_SEED, ARCHIVO_DB);
  }
}

/** Lee toda la "base de datos" desde disco. */
function leer() {
  return JSON.parse(fs.readFileSync(ARCHIVO_DB, 'utf-8'));
}

/** Escribe la base de datos de forma atómica. */
function escribir(datos) {
  const temporal = `${ARCHIVO_DB}.tmp`;
  fs.writeFileSync(temporal, JSON.stringify(datos, null, 2), 'utf-8');
  fs.renameSync(temporal, ARCHIVO_DB);
}

/** Restaura el estado inicial (usado por `npm run api:reset`). */
function reiniciar() {
  fs.mkdirSync(path.dirname(ARCHIVO_DB), { recursive: true });
  fs.copyFileSync(ARCHIVO_SEED, ARCHIVO_DB);
}

/** Siguiente id con formato a-001, a-002… (máximo existente + 1). */
function siguienteIdAlerta(alertas) {
  const mayor = alertas
    .map(a => /^a-(\d+)$/.exec(a.id))
    .filter(Boolean)
    .reduce((max, m) => Math.max(max, Number(m[1])), 0);
  return `a-${String(mayor + 1).padStart(3, '0')}`;
}

module.exports = { inicializar, leer, escribir, reiniciar, siguienteIdAlerta, ARCHIVO_DB };
