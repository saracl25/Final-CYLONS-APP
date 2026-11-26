/**
 * Configuración global de la aplicación (standalone).
 * - provideRouter: navegación entre vistas (con binding de parámetros a input()).
 * - provideHttpClient: permite inyectar HttpClient en los servicios
 *   (CylonsService lo usa para hablar con el Back-End Express).
 */
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient()
  ]
};
