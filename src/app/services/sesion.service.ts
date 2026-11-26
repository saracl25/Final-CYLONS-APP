/**
 * SesionService
 * -----------------------------------------------------------------------------
 * Estado de la sesión de navegación (ruta en curso y guía por voz).
 * Vive en un servicio para que sobreviva al cambio de vistas con el router:
 * si el usuario va a "Reportar" y vuelve, su ruta sigue activa.
 */
import { Injectable, inject, signal } from '@angular/core';
import { Ruta } from '../models/ruta.model';
import { VozService } from './voz.service';

@Injectable({ providedIn: 'root' })
export class SesionService {

  private readonly voz = inject(VozService);

  /** Ruta seleccionada por el usuario (null = sin navegación activa). */
  readonly rutaActiva = signal<Ruta | null>(null);

  /** ¿La guía por voz está encendida? */
  readonly vozActiva = signal<boolean>(false);

  /** El usuario inicia una ruta: queda activa y se enciende la guía. */
  iniciarRuta(ruta: Ruta): void {
    this.rutaActiva.set(ruta);
    this.vozActiva.set(true);
  }

  /** Enciende o apaga la guía audible. */
  alternarVoz(activa: boolean): void {
    this.vozActiva.set(activa);
    if (!activa) {
      this.voz.detener();
    }
  }
}
