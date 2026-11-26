/**
 * Rutas de navegación de CYLONS.
 *   /              Guía: asistencia por voz + rutas seguras
 *   /alertas       Listado completo de obstáculos
 *   /reportar      Formulario para reportar un obstáculo (POST al back-end)
 *   /rutas/:id     Detalle de una ruta (GET /api/rutas/:id)
 *   **             Página no encontrada
 */
import { Routes } from '@angular/router';
import { GuiaComponent } from './pages/guia/guia.component';
import { AlertasComponent } from './pages/alertas/alertas.component';
import { ReportarComponent } from './pages/reportar/reportar.component';
import { RutaDetalleComponent } from './pages/ruta-detalle/ruta-detalle.component';
import { NoEncontradoComponent } from './pages/no-encontrado/no-encontrado.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: GuiaComponent, title: 'CYLONS · Guía' },
  { path: 'alertas', component: AlertasComponent, title: 'CYLONS · Alertas' },
  { path: 'reportar', component: ReportarComponent, title: 'CYLONS · Reportar obstáculo' },
  { path: 'rutas/:id', component: RutaDetalleComponent, title: 'CYLONS · Detalle de ruta' },
  { path: '**', component: NoEncontradoComponent, title: 'CYLONS · No encontrado' }
];
