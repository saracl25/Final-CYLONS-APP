/**
 * VozService
 * -----------------------------------------------------------------------------
 * Encapsula la síntesis de voz local del navegador (Web Speech API).
 * Es la "guía de voz simulada" del proyecto: no requiere backend ni conexión,
 * y si el navegador no soporta TTS la aplicación sigue siendo funcional.
 */
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VozService {

  /** Indica si el navegador actual soporta síntesis de voz. */
  readonly disponible: boolean =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  /** Lee un texto en español con la voz local del sistema. */
  hablar(texto: string): void {
    if (!this.disponible) return;
    try {
      window.speechSynthesis.cancel(); // corta el mensaje anterior
      const mensaje = new SpeechSynthesisUtterance(texto);
      mensaje.lang = 'es-ES';
      mensaje.rate = 1;   // velocidad de lectura (futura preferencia de usuario)
      window.speechSynthesis.speak(mensaje);
    } catch {
      // Navegadores sin TTS: la guía sigue siendo visual, no se lanza error
    }
  }

  /** Detiene cualquier locución en curso. */
  detener(): void {
    if (!this.disponible) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* silencioso */
    }
  }
}
