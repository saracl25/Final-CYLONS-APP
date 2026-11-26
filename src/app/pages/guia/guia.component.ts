/**
 * GuiaComponent · Vista principal (ruta "/")
 * Compone el panel de asistencia por voz con la lista de rutas seguras.
 * El estado (ruta activa, voz) vive en SesionService; los datos, en CylonsService.
 */
import { Component, inject } from '@angular/core';
import { VoicePanelComponent } from '../../components/voice-panel/voice-panel.component';
import { RouteListComponent } from '../../components/route-list/route-list.component';
import { CylonsService } from '../../services/cylons.service';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-guia',
  standalone: true,
  imports: [VoicePanelComponent, RouteListComponent],
  templateUrl: './guia.component.html',
  styleUrl: './guia.component.css'
})
export class GuiaComponent {
  readonly cylons = inject(CylonsService);
  readonly sesion = inject(SesionService);
}
