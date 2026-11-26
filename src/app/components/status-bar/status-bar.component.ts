/**
 * StatusBarComponent · Navbar superior
 * -----------------------------------------------------------------------------
 * Componente de presentación con estado interno propio (Signals locales):
 * - Hora del dispositivo.
 * - Batería simulada (decrece lentamente para evidenciar reactividad).
 * - Precisión GPS simulada.
 * - Estado de la guía TTS (recibido del padre vía input()).
 */
import { Component, OnDestroy, OnInit, input, signal } from '@angular/core';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.css'
})
export class StatusBarComponent implements OnInit, OnDestroy {

  /** Estado de la guía por voz, controlado por el componente raíz. */
  readonly vozActiva = input<boolean>(false);

  // ---- Estado local simulado del dispositivo (Signals) ----
  readonly hora = signal<string>('--:--');
  readonly bateria = signal<number>(87);
  readonly precisionGps = signal<number>(4);

  private timerReloj?: ReturnType<typeof setInterval>;
  private timerBateria?: ReturnType<typeof setInterval>;
  private timerGps?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.actualizarHora();
    this.timerReloj = setInterval(() => this.actualizarHora(), 15000);
    this.timerBateria = setInterval(
      () => this.bateria.update(nivel => (nivel > 15 ? nivel - 1 : nivel)),
      40000
    );
    this.timerGps = setInterval(
      () => this.precisionGps.update(p => (p >= 6 ? 3 : p + 1)),
      8000
    );
  }

  ngOnDestroy(): void {
    // Limpieza de temporizadores: evita fugas de memoria
    if (this.timerReloj) clearInterval(this.timerReloj);
    if (this.timerBateria) clearInterval(this.timerBateria);
    if (this.timerGps) clearInterval(this.timerGps);
  }

  private actualizarHora(): void {
    this.hora.set(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
  }
}
