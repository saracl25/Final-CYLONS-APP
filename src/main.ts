/**
 * Punto de arranque de CYLONS.
 * Se usa bootstrapApplication (componentes standalone, sin NgModule).
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
