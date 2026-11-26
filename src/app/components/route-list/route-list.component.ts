/**
 * RouteListComponent · COMPONENTE PADRE de la lista de rutas
 * -----------------------------------------------------------------------------
 * Colección de rutas seguras. Recibe los datos desde el componente raíz
 * mediante input() y los reparte a cada tarjeta hija (RouteCardComponent).
 *
 * Cuando el hijo emite su evento output(), este componente lo reenvía hacia
 * arriba: RouteCard -> RouteList -> AppComponent.
 */
import { Component, input, output } from '@angular/core';
import { RouteCardComponent } from '../route-card/route-card.component';
import { Ruta } from '../../models/ruta.model';

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [RouteCardComponent],
  templateUrl: './route-list.component.html',
  styleUrl: './route-list.component.css'
})
export class RouteListComponent {

  /** Colección de rutas obtenidas por CylonsService (desde el JSON). */
  readonly rutas = input.required<Ruta[]>();

  /** Id de la ruta en curso, para resaltar la tarjeta correspondiente. */
  readonly rutaActivaId = input<string | null>(null);

  /** Evento reenviado desde la tarjeta hija hasta el componente raíz. */
  readonly rutaSeleccionada = output<Ruta>();
}
