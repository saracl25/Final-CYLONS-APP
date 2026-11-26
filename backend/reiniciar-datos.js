/** Restaura backend/data/db.json al estado inicial (db.seed.json). */
const db = require('./db');
db.reiniciar();
console.log('Datos restaurados al estado inicial:', db.ARCHIVO_DB);
