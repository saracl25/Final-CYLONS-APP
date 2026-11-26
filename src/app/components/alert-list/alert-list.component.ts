/**
 * AlertListComponent · Lista reutilizable de obstáculos
 * Se usa en el panel de voz (vista Guía) y en la vista Alertas.
 * Recibe el arreglo ya ordenado/filtrado desde su padre vía input().
 */
import { Component, input } from '@angular/core';
import { Alerta } from '../../models/alerta.model';

@Component({
  selector: 'app-alert-list',
  standalone: true,
  templateUrl: './alert-list.component.html',
  styleUrl: './alert-list.component.css'
})
export class AlertListComponent {
  readonly alertas = input.required<Alerta[]>();
}
