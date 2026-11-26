/**
 * RutaDetalleComponent · Vista "/rutas/:id"
 * -----------------------------------------------------------------------------
 * Segundo flujo de CONSULTA: GET /api/rutas/:id. Muestra los estados:
 * cargando, éxito, información inexistente (404 / id inválido 400) y error.
 * El parámetro :id llega como input() gracias a withComponentInputBinding().
 */
import { Component, OnDestroy, effect, inject, input, signal, untracked } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CylonsService } from '../../services/cylons.service';
import { SesionService } from '../../services/sesion.service';
import { Ruta, NivelAccesibilidad } from '../../models/ruta.model';
import { describirError } from '../../utils/errores-api';

type EstadoCarga = 'cargando' | 'ok' | 'no-encontrado' | 'error';

@Component({
  selector: 'app-ruta-detalle',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './ruta-detalle.component.html',
  styleUrl: './ruta-detalle.component.css'
})
export class RutaDetalleComponent implements OnDestroy {

  /** Parámetro de la URL (:id), entregado por el router. */
  readonly id = input.required<string>();

  private readonly cylons = inject(CylonsService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  readonly ruta = signal<Ruta | null>(null);
  readonly estado = signal<EstadoCarga>('cargando');
  readonly mensaje = signal<string>('');

  readonly etiquetas: Record<NivelAccesibilidad, string> = {
    alta: 'Accesibilidad alta',
    media: 'Accesibilidad media',
    baja: 'Accesibilidad baja'
  };

  private suscripcion?: Subscription;

  constructor() {
    // Cada vez que cambia el :id de la URL se vuelve a consultar al servidor
    effect(() => {
      const id = this.id();
      untracked(() => this.cargar(id));
    });
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  cargar(id: string): void {
    this.suscripcion?.unsubscribe();
    this.estado.set('cargando');
    this.ruta.set(null);

    this.suscripcion = this.cylons.obtenerRuta(id).subscribe({
      next: ruta => {
        this.ruta.set(ruta);
        this.estado.set('ok');
      },
      error: err => {
        const detalle = describirError(err);
        this.mensaje.set(detalle.mensaje);
        // 404 (no existe) y 400 (id con formato inválido) => "información inexistente"
        const inexistente = detalle.tipo === 'no-encontrado' || detalle.tipo === 'validacion';
        this.estado.set(inexistente ? 'no-encontrado' : 'error');
      }
    });
  }

  /** Inicia la guía con esta ruta y vuelve a la vista principal. */
  iniciarGuia(ruta: Ruta): void {
    this.sesion.iniciarRuta(ruta);
    this.router.navigateByUrl('/');
  }
}
