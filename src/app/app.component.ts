/**
 * AppComponent · Componente raíz (shell) de CYLONS
 * -----------------------------------------------------------------------------
 * Responsabilidades:
 * 1. Dibujar el marco fijo: barra de estado, navegación y pie.
 * 2. Disparar la carga inicial de datos (GET al back-end) en CylonsService.
 * 3. Mostrar los estados globales con @if: cargando / error / contenido.
 * 4. Alojar las vistas del router en <router-outlet>.
 */
import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { CylonsService } from './services/cylons.service';
import { SesionService } from './services/sesion.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, StatusBarComponent, NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  /** Servicio de datos: expone rutas, alertas, isLoading y errorMessage. */
  readonly cylons = inject(CylonsService);

  /** Estado de la sesión (ruta activa y guía por voz). */
  readonly sesion = inject(SesionService);

  ngOnInit(): void {
    // El componente raíz dispara la carga; el servicio sabe a qué API llamar
    this.cylons.cargarDatos();
  }

  /** Botón "Reintentar" del estado de error. */
  reintentar(): void {
    this.cylons.cargarDatos();
  }
}
