/**
 * RouteCardComponent · COMPONENTE HIJO (tarjeta de ruta individual)
 * -----------------------------------------------------------------------------
 * Componente reutilizable que representa UNA ruta.
 *
 * Comunicación:
 * - input():    el padre le entrega la ruta y si está activa.
 * - output():   emite 'seleccionar' cuando el usuario pulsa "Iniciar guía",
 *               delegando la decisión al componente padre.
 */
import { Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Ruta, NivelAccesibilidad } from '../../models/ruta.model';

@Component({
  selector: 'app-route-card',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './route-card.component.html',
  styleUrl: './route-card.component.css'
})
export class RouteCardComponent {

  /** Ruta que esta tarjeta debe pintar (obligatoria). */
  readonly ruta = input.required<Ruta>();

  /** true cuando esta ruta es la que está en curso. */
  readonly activa = input<boolean>(false);

  /** Evento hacia el padre: el usuario quiere iniciar esta ruta. */
  readonly seleccionar = output<Ruta>();

  /** Etiqueta legible según el nivel de accesibilidad de la ruta. */
  readonly etiquetaAccesibilidad = computed<string>(() => {
    const etiquetas: Record<NivelAccesibilidad, string> = {
      alta: 'Accesibilidad alta',
      media: 'Accesibilidad media',
      baja: 'Accesibilidad baja'
    };
    return etiquetas[this.ruta().nivelAccesibilidad];
  });

  /** Manejador del evento de clic: emite la ruta completa hacia arriba. */
  iniciarGuia(): void {
    this.seleccionar.emit(this.ruta());
  }
}
