/**
 * CylonsService
 * -----------------------------------------------------------------------------
 * Única responsable de hablar con el Back-End (Node.js + Express) mediante
 * HttpClient y de exponer el estado global con Angular Signals.
 *
 * Flujo de la solución:
 *   Componente -> CylonsService -> HttpClient -> HTTP -> Express -> backend/db.js
 *
 * Los componentes NUNCA conocen las URLs: solo leen señales y llaman a los
 * métodos públicos de este servicio.
 */
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, forkJoin, of, tap } from 'rxjs';
import { Ruta } from '../models/ruta.model';
import { Alerta, NuevaAlerta } from '../models/alerta.model';
import { Usuario } from '../models/usuario.model';
import { describirError } from '../utils/errores-api';

@Injectable({ providedIn: 'root' })
export class CylonsService {

  private readonly http = inject(HttpClient);

  /**
   * Base de la API. En desarrollo, `proxy.conf.json` reenvía /api hacia
   * http://localhost:3000 (Express), por lo que no hay problemas de CORS.
   */
  private readonly api =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '/api'
    : 'https://final-cylons-app.onrender.com/api';
    
  // ---------------------- ESTADO GLOBAL (Angular Signals) ----------------------

  /** Rutas seguras obtenidas del servidor. */
  readonly rutas = signal<Ruta[]>([]);

  /** Alertas / obstáculos reportados (incluye los guardados por usuarios). */
  readonly alertas = signal<Alerta[]>([]);

  /** Perfil del usuario asistido. */
  readonly usuario = signal<Usuario | null>(null);

  /** true mientras la carga inicial está en curso. */
  readonly isLoading = signal<boolean>(true);

  /** Mensaje de error legible; null cuando todo va bien. */
  readonly errorMessage = signal<string | null>(null);

  // ------------------------------ OPERACIONES ---------------------------------

  /**
   * CONSULTA (GET): pide al servidor usuario, rutas y alertas en paralelo y
   * actualiza las señales según el resultado: cargando, éxito o error.
   */
  cargarDatos(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      usuario: this.http.get<Usuario>(`${this.api}/usuario`),
      rutas: this.http.get<Ruta[]>(`${this.api}/rutas`),
      alertas: this.http.get<Alerta[]>(`${this.api}/alertas`)
    }).pipe(
      tap(datos => {
        this.usuario.set(datos.usuario);
        this.rutas.set(datos.rutas);
        this.alertas.set(datos.alertas);
      }),
      catchError(err => {
        this.errorMessage.set(describirError(err).mensaje);
        return of(null);
      }),
      // Pase lo que pase, el estado de carga siempre termina
      finalize(() => this.isLoading.set(false))
    ).subscribe();
  }

  /** CONSULTA (GET /api/rutas/:id): una ruta; el 400/404 lo maneja el componente. */
  obtenerRuta(id: string): Observable<Ruta> {
    return this.http.get<Ruta>(`${this.api}/rutas/${encodeURIComponent(id)}`);
  }

  /**
   * ENVÍO (POST /api/alertas): el servidor valida, persiste y devuelve la
   * alerta creada (201). El error se propaga para que el formulario muestre
   * el motivo exacto (validación, sin conexión, etc.).
   */
  crearAlerta(datos: NuevaAlerta): Observable<Alerta> {
    return this.http.post<Alerta>(`${this.api}/alertas`, datos).pipe(
      // update() crea una NUEVA lista (inmutabilidad) y dispara la reactividad
      tap(creada => this.alertas.update(lista => [creada, ...lista]))
    );
  }
}
