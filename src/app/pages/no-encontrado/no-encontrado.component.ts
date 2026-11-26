/** NoEncontradoComponent · Comodín "**": dirección inexistente en el router. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="estado card" role="alert">
      <h1>Página no encontrada</h1>
      <p>La dirección que intentaste abrir no existe en CYLONS.</p>
      <a routerLink="/" class="btn btn-primario">Volver a la guía</a>
    </section>
  `,
  styles: [`h1 { font-size: 24px; margin: 0; }`]
})
export class NoEncontradoComponent {}
