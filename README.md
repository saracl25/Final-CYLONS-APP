# CYLONS · Entrega final — Front-End Angular + Back-End Node.js/Express

**Aplicación de asistencia de navegación accesible para personas con discapacidad visual.**
Proyecto del **Grupo JOVIAL** · Desarrollo Web.

Evolución del proyecto: la 2.ª entrega (Front-End con datos en un JSON estático) ahora se integra con un
**Back-End propio** que valida, procesa y **persiste** la información que genera el usuario.

---

## Ejecución

Requisitos: **Node.js 20.19+** (o 22.12+) y npm.

```bash
npm install          # instala Front-End y Back-End (un solo package.json)
```

Se necesitan **dos terminales**:

```bash
# Terminal 1 · Back-End (Express) -> http://localhost:3000/api
npm run api

# Terminal 2 · Front-End (Angular) -> http://localhost:4200
npm start
```

El Front-End reenvía `/api` hacia el puerto 3000 mediante `proxy.conf.json` (no hay problemas de CORS).
Para devolver los datos al estado inicial: `npm run api:reset`.

---

## Arquitectura

```
Usuario
   ↓
Front-End · Angular (componentes, router, formulario reactivo)
   ↓
Services + HttpClient   (CylonsService)
   ↓
HTTP / JSON             (/api/...)
   ↓
Back-End · Node.js + Express (validación, procesamiento, códigos HTTP)
   ↓
Persistencia            (backend/data/db.json)
```

## Estructura del repositorio

```
cylons-app/
├── src/                          · Front-End Angular
│   └── app/
│       ├── app.routes.ts         · Rutas: /, /alertas, /reportar, /rutas/:id, **
│       ├── app.component.*       · Shell: barra, navegación, estados globales, <router-outlet>
│       ├── pages/                · Vistas (guia, alertas, reportar, ruta-detalle, no-encontrado)
│       ├── components/           · status-bar, nav-bar, voice-panel, route-list, route-card, alert-list
│       ├── services/             · cylons.service (HttpClient + Signals), sesion.service, voz.service
│       ├── models/               · Ruta, Alerta, NuevaAlerta, Usuario (tipados)
│       └── utils/errores-api.ts  · Traduce errores HTTP a mensajes comprensibles
├── public/                       · Recursos estáticos
├── backend/                      · Back-End Node.js + Express
│   ├── server.js                 · API (rutas, respuestas JSON, códigos HTTP, manejo de errores)
│   ├── validaciones.js           · Reglas de validación del servidor
│   ├── db.js                     · Persistencia en archivo JSON (escritura atómica)
│   ├── reiniciar-datos.js        · Restaura el estado inicial
│   └── data/db.seed.json         · Datos iniciales (db.json se crea solo al arrancar)
├── proxy.conf.json               · /api -> http://localhost:3000
└── package.json
```

---

## API implementada

| Método | Endpoint | Propósito | Respuestas |
|---|---|---|---|
| GET | `/api/salud` | Comprobar que el servicio está activo | 200 |
| GET | `/api/usuario` | Perfil de la persona asistida | 200 |
| GET | `/api/rutas` | Listar las rutas seguras | 200 |
| GET | `/api/rutas/:id` | Consultar una ruta por identificador | 200 · 400 (id inválido) · 404 (no existe) |
| GET | `/api/alertas` | Listar obstáculos (los más recientes primero) | 200 |
| POST | `/api/alertas` | **Reportar un obstáculo** (valida + persiste) | 201 · 400 (datos inválidos) |

Errores en JSON: `{ "mensaje": "...", "errores": { "campo": "motivo" } }`.

Ejemplo de `POST /api/alertas`:

```json
{ "tipoAlerta": "obra", "distanciaMetros": 60, "severidad": "alta", "ubicacion": "Carrera 43A con Calle 10" }
```

## Validaciones (en el servidor)

| Campo | Regla |
|---|---|
| `tipoAlerta` | Obligatorio · `peatón`, `obra` o `escalón` |
| `severidad` | Obligatoria · `baja`, `media` o `alta` |
| `distanciaMetros` | Obligatoria · número · entre 1 y 500 m (regla del dominio: obstáculos *cercanos*) |
| `ubicacion` | Opcional · texto · máximo 120 caracteres |
| `:id` de ruta | Formato `r-001` (400 si no cumple, 404 si no existe) |
| Cuerpo | Debe ser un objeto JSON válido (400 si está mal formado) |

El formulario Angular aplica las mismas reglas para dar respuesta inmediata, pero **el servidor no depende de él**.

## Persistencia

- **Qué se guarda:** los obstáculos reportados por el usuario (con `id` y `creadaEn` asignados por el servidor).
- **Dónde:** `backend/data/db.json` (se crea a partir de `db.seed.json` al primer arranque).
- **Cómo se recupera:** `GET /api/alertas` lee el archivo; al recargar la página o reiniciar el servidor, el reporte sigue ahí.

## Manejo de errores en la interfaz

| Situación | Qué ve el usuario |
|---|---|
| Cargando datos | Spinner "Cargando rutas y alertas…" |
| Servidor apagado / sin conexión | Panel de error con **Reintentar** (carga inicial) o aviso en el formulario |
| Datos inválidos (400) | Mensaje junto a cada campo + aviso general |
| Información inexistente (404 / id inválido) | "Ruta no encontrada" en `/rutas/:id`; página 404 para URLs desconocidas |
| Envío exitoso (201) | Confirmación con el código asignado |

---

## Guion de demostración (recorrido pedido en la guía)

1. **Inicio**: `npm run api` y `npm start`; abrir `http://localhost:4200`.
2. **Navegación principal**: Guía → Alertas → Reportar obstáculo.
3. **Consulta**: en *Guía*, abrir DevTools → **Network** y recargar: se ven `GET /api/usuario`, `/api/rutas` y `/api/alertas`. Abrir una ruta (clic en el nombre) → `GET /api/rutas/r-002`.
4. **Formulario**: *Reportar obstáculo* → enviar vacío (validaciones) → completar y enviar.
5. **Comunicación con el Back-End**: en Network, `POST /api/alertas` → **201** con el objeto creado.
6. **Persistencia**: ir a *Alertas* y recargar la página (F5): el reporte sigue ahí. Opcional: reiniciar el servidor y recargar.
7. **Manejo de errores**: detener el servidor (Ctrl+C) y enviar el formulario → aviso comprensible; en `/rutas/r-999` → "Ruta no encontrada".

### Evidencia HTTP con curl (validación en el servidor)

```bash
curl -i http://localhost:3000/api/rutas/r-002
curl -i http://localhost:3000/api/rutas/r-999           # 404
curl -i http://localhost:3000/api/rutas/abc             # 400
curl -i -X POST http://localhost:3000/api/alertas -H "Content-Type: application/json" \
  -d '{"tipoAlerta":"obra","distanciaMetros":60,"severidad":"alta"}'                  # 201
curl -i -X POST http://localhost:3000/api/alertas -H "Content-Type: application/json" \
  -d '{"tipoAlerta":"perro","distanciaMetros":9999,"severidad":""}'                   # 400
```

---

## Pruebas antes de entregar

| Comprobación | Resultado esperado |
|---|---|
| Front-End inicia (`npm start`) | Sí |
| Back-End inicia (`npm run api`) | Sí |
| Navegación entre vistas | Sí |
| GET (rutas, alertas, ruta por id) | Sí |
| POST (reportar obstáculo) | Sí |
| Validaciones (cliente y servidor) | Sí |
| Persistencia tras recargar / reiniciar | Sí |
| Manejo de errores (servidor apagado, 400, 404) | Sí |
| Responsive básico (DevTools, 360 px y 1280 px) | Sí |
| Repositorio = versión presentada | Sí |

## Limitaciones y mejoras posibles

- Persistencia en archivo JSON: suficiente para el alcance del curso; una base de datos (SQLite/MongoDB) sería el siguiente paso.
- No hay autenticación: los reportes no están asociados a un usuario.
- Los reportes no tienen coordenadas GPS reales (datos de GPS y batería de la barra superior son simulados).
- Las instrucciones de la guía por voz son un guion simulado; no calculan rutas reales.
- No hay edición ni eliminación de alertas (la guía no exige CRUD completo).

## Notas técnicas

- **Guía por voz:** usa la Web Speech API del navegador (local). Recomendado Chrome o Edge; sin soporte de TTS la app sigue siendo funcional.
- Sin Angular Material a propósito: CSS propio para controlar contraste (AAA), foco visible y tamaños táctiles.
- Estado con **Signals**; comunicación padre-hijo con `input()` / `output()`; formularios **reactivos**.
