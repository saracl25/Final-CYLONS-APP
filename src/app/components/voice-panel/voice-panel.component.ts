/**
 * VoicePanelComponent · Panel principal de asistencia por voz y alertas
 * -----------------------------------------------------------------------------
 * Recibe el estado de la sesión desde el componente raíz vía input():
 * - rutaActiva: ruta seleccionada por el usuario (o null).
 * - alertas:    obstáculos provenientes del estado global (CylonsService).
 * - vozActiva:  si la guía audible está encendida.
 *
 * Emite eventos hacia el padre con output():
 * - vozToggle: solicita encender/apagar la guía.
 *
 * El botón "Reportar obstáculo" navega al formulario (/reportar).
 *
 * Cuando la guía está activa, cicla instrucciones paso a paso y las lee
 * en voz alta con VozService (Web Speech API local).
 */
import { Component, OnDestroy, computed, effect, inject, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlertListComponent } from '../alert-list/alert-list.component';
import { VozService } from '../../services/voz.service';
import { Ruta } from '../../models/ruta.model';
import { Alerta } from '../../models/alerta.model';

@Component({
  selector: 'app-voice-panel',
  standalone: true,
  imports: [DecimalPipe, RouterLink, AlertListComponent],
  templateUrl: './voice-panel.component.html',
  styleUrl: './voice-panel.component.css'
})
export class VoicePanelComponent implements OnDestroy {

  // ------------------- Comunicación con el padre (input/output) -------------------
  readonly rutaActiva = input<Ruta | null>(null);
  readonly alertas = input<Alerta[]>([]);
  readonly vozActiva = input<boolean>(false);

  readonly vozToggle = output<boolean>();

  // ------------------------------ Estado interno ---------------------------------
  private readonly voz = inject(VozService);

  /** Índice de la instrucción actual del ciclo de guía. */
  readonly indiceInstruccion = signal<number>(0);

  /** Alertas ordenadas por distancia (las más cercanas primero). */
  readonly alertasOrdenadas = computed<Alerta[]>(() =>
    [...this.alertas()].sort((a, b) => a.distanciaMetros - b.distanciaMetros)
  );

  /** Guion de instrucciones derivado de la ruta activa (computed). */
  readonly instrucciones = computed<string[]>(() => {
    const ruta = this.rutaActiva();
    if (!ruta) return [];
    return [
      `Ruta iniciada hacia ${ruta.nombreDestino}.`,
      `Distancia total: ${ruta.distanciaKm} kilómetros. Tiempo estimado: ${ruta.tiempoEstimado} minutos.`,
      'Continúa por la acera derecha. Acera libre de obstáculos.',
      'Atención: cruce peatonal a 20 metros. Semáforo sonoro disponible.',
      'Gira a la izquierda en la próxima esquina.',
      `Has llegado a ${ruta.nombreDestino}. Ruta completada.`
    ];
  });

  /** Progreso del ciclo de instrucciones (0-100) para la barra visual. */
  readonly progreso = computed<number>(() =>
    this.instrucciones().length
      ? ((this.indiceInstruccion() + 1) / this.instrucciones().length) * 100
      : 0
  );

  private intervalo: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Efecto: reacciona a cambios de voz/ruta para iniciar o detener el ciclo
    effect(() => {
      if (this.vozActiva() && this.rutaActiva()) {
        this.iniciarCiclo();
      } else {
        this.detenerCiclo();
      }
    });
  }

  ngOnDestroy(): void {
    this.detenerCiclo();
  }

  // ------------------------------ Eventos (output) ------------------------------
  alternarVoz(): void {
    this.vozToggle.emit(!this.vozActiva());
  }

  // ------------------------------ Ciclo de guía ---------------------------------
  private iniciarCiclo(): void {
    this.detenerCiclo();
    this.indiceInstruccion.set(0);
    this.anunciarActual();

    this.intervalo = setInterval(() => {
      const total = this.instrucciones().length;
      this.indiceInstruccion.update(i => (i + 1) % total);
      this.anunciarActual();
    }, 6500);
  }

  private detenerCiclo(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
    this.voz.detener();
  }

  private anunciarActual(): void {
    const textos = this.instrucciones();
    if (textos.length > 0) {
      this.voz.hablar(textos[this.indiceInstruccion()]);
    }
  }
}
