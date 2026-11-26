/**
 * CYLONS · Back-End (Node.js + Express)
 * -----------------------------------------------------------------------------
 * Responsabilidades del servidor:
 *   1. Recibir solicitudes HTTP del Front-End Angular (HttpClient).
 *   2. Validar la información crítica antes de aceptarla.
 *   3. Procesar y persistir los datos (backend/db.js -> archivo JSON).
 *   4. Responder siempre en JSON con códigos HTTP apropiados.
 *
 * API:
 *   GET  /api/salud        Estado del servicio
 *   GET  /api/usuario      Perfil de la persona asistida
 *   GET  /api/rutas        Rutas seguras disponibles
 *   GET  /api/rutas/:id    Una ruta por identificador (400 / 404 si no aplica)
 *   GET  /api/alertas      Obstáculos reportados (los más recientes primero)
 *   POST /api/alertas      Reportar un obstáculo (valida + persiste -> 201)
 */
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { validarNuevaAlerta, idRutaValido } = require('./validaciones');

const app = express();
db.inicializar();

app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'https://saracl25.github.io'
  ]
}));
app.use(express.json({ limit: '10kb' }));

// ------------------------------- Consultas (GET) -------------------------------

app.get('/api/salud', (_req, res) => {
  res.json({ estado: 'ok', servicio: 'cylons-api', hora: new Date().toISOString() });
});

app.get('/api/usuario', (_req, res) => {
  res.json(db.leer().usuario);
});

app.get('/api/rutas', (_req, res) => {
  res.json(db.leer().rutas);
});

app.get('/api/rutas/:id', (req, res) => {
  const { id } = req.params;

  if (!idRutaValido(id)) {
    return res.status(400).json({
      mensaje: 'El identificador de la ruta no es válido.',
      errores: { id: 'Formato esperado: r-001.' }
    });
  }

  const ruta = db.leer().rutas.find(r => r.id === id);
  if (!ruta) {
    return res.status(404).json({ mensaje: `No existe una ruta con id ${id}.` });
  }
  res.json(ruta);
});

app.get('/api/alertas', (_req, res) => {
  // Las más recientemente creadas primero
  res.json([...db.leer().alertas].reverse());
});

// ------------------------------ Creación (POST) --------------------------------

app.post('/api/alertas', (req, res) => {
  const errores = validarNuevaAlerta(req.body);
  if (Object.keys(errores).length > 0) {
    return res.status(400).json({
      mensaje: 'Los datos del obstáculo no son válidos.',
      errores
    });
  }

  const datos = db.leer();
  const ubicacion = typeof req.body.ubicacion === 'string' ? req.body.ubicacion.trim() : '';

  // Se guarda solo lo permitido (lista blanca): nunca el cuerpo completo recibido
  const nueva = {
    id: db.siguienteIdAlerta(datos.alertas),
    tipoAlerta: req.body.tipoAlerta,
    distanciaMetros: Math.round(req.body.distanciaMetros),
    severidad: req.body.severidad,
    ...(ubicacion ? { ubicacion } : {}),
    creadaEn: new Date().toISOString()
  };

  datos.alertas.push(nueva);
  db.escribir(datos);

  res.status(201).location(`/api/alertas/${nueva.id}`).json(nueva);
});

// --------------------------- Rutas inexistentes y errores ----------------------

app.use('/api', (req, res) => {
  res.status(404).json({ mensaje: `El recurso ${req.method} ${req.originalUrl} no existe.` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // JSON mal formado enviado por el cliente
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la solicitud no es un JSON válido.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ mensaje: 'La solicitud es demasiado grande.' });
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

// ------------------------------------ Arranque ---------------------------------

const PUERTO = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PUERTO, () => {
    console.log(`CYLONS API escuchando en http://localhost:${PUERTO}/api`);
    console.log(`Persistencia en: ${db.ARCHIVO_DB}`);
  });
}

module.exports = app;
