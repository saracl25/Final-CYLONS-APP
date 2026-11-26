/**
 * AlertasComponent · Vista "/alertas"
 * Listado completo de obstáculos (incluye los reportados por usuarios y
 * guardados en el servidor) con filtro por severidad.
 */
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertListComponent } from '../../components/alert-list/alert-list.component';
import { CylonsService } from '../../services/cylons.service';
import { Alerta, Severidad } from '../../models/alerta.model';

type Filtro = 'todas' | Severidad;

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [AlertListComponent, RouterLink],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css'
})
export class AlertasComponent {
  readonly cylons = inject(CylonsService);

  readonly filtros: { valor: Filtro; etiqueta: string }[] = [
    { valor: 'todas', etiqueta: 'Todas' },
    { valor: 'alta', etiqueta: 'Alta' },
    { valor: 'media', etiqueta: 'Media' },
    { valor: 'baja', etiqueta: 'Baja' }
  ];

  readonly filtro = signal<Filtro>('todas');

  /** Alertas según el filtro elegido (computed: se recalcula solo). */
  readonly visibles = computed<Alerta[]>(() => {
    const f = this.filtro();
    const todas = this.cylons.alertas();
    return f === 'todas' ? todas : todas.filter(a => a.severidad === f);
  });
}
