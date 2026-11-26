/**
 * ReportarComponent · Vista "/reportar"
 * -----------------------------------------------------------------------------
 * Formulario reactivo para reportar un obstáculo. Es el FLUJO DE ENVÍO:
 *
 *   Formulario -> validación en el cliente -> CylonsService.crearAlerta()
 *      -> POST /api/alertas (Express valida de nuevo y persiste)
 *      -> respuesta 201 (éxito) o 400 / sin conexión (error comprensible)
 *
 * Estados visibles: inactivo, enviando, éxito y error. Los errores de
 * validación devueltos por el servidor se muestran junto a cada campo.
 */
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CylonsService } from '../../services/cylons.service';
import { VozService } from '../../services/voz.service';
import { Alerta, NuevaAlerta, Severidad, TipoAlerta } from '../../models/alerta.model';
import { describirError } from '../../utils/errores-api';

type CampoForm = 'tipoAlerta' | 'distanciaMetros' | 'severidad' | 'ubicacion';
type EstadoEnvio = 'inactivo' | 'enviando' | 'exito' | 'error';

/** Mismas reglas del dominio que valida el back-end (backend/validaciones.js). */
const DISTANCIA_MIN = 1;
const DISTANCIA_MAX = 500;
const UBICACION_MAX = 120;

@Component({
  selector: 'app-reportar',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reportar.component.html',
  styleUrl: './reportar.component.css'
})
export class ReportarComponent {

  private readonly cylons = inject(CylonsService);
  private readonly voz = inject(VozService);

  readonly tipos: { valor: TipoAlerta; etiqueta: string }[] = [
    { valor: 'peatón', etiqueta: 'Peatón' },
    { valor: 'obra', etiqueta: 'Obra' },
    { valor: 'escalón', etiqueta: 'Escalón' }
  ];

  readonly severidades: { valor: Severidad; etiqueta: string }[] = [
    { valor: 'baja', etiqueta: 'Baja' },
    { valor: 'media', etiqueta: 'Media' },
    { valor: 'alta', etiqueta: 'Alta' }
  ];

  readonly distanciaMin = DISTANCIA_MIN;
  readonly distanciaMax = DISTANCIA_MAX;
  readonly ubicacionMax = UBICACION_MAX;

  /** Formulario reactivo con validaciones del lado del cliente. */
  readonly form = new FormGroup({
    tipoAlerta: new FormControl<TipoAlerta | ''>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    distanciaMetros: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(DISTANCIA_MIN),
      Validators.max(DISTANCIA_MAX)
    ]),
    severidad: new FormControl<Severidad | ''>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    ubicacion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(UBICACION_MAX)]
    })
  });

  // ---------------------------- Estado de la vista -----------------------------
  readonly estado = signal<EstadoEnvio>('inactivo');
  readonly errorGeneral = signal<string | null>(null);
  readonly erroresServidor = signal<Partial<Record<CampoForm, string>>>({});
  readonly alertaCreada = signal<Alerta | null>(null);
  readonly intentoEnvio = signal<boolean>(false);

  private readonly mensajesCliente: Record<CampoForm, Record<string, string>> = {
    tipoAlerta: { required: 'Elige el tipo de obstáculo.' },
    distanciaMetros: {
      required: 'Indica a cuántos metros está el obstáculo.',
      min: `La distancia mínima es ${DISTANCIA_MIN} metro.`,
      max: `La distancia máxima es ${DISTANCIA_MAX} metros.`
    },
    severidad: { required: 'Elige qué tan grave es el obstáculo.' },
    ubicacion: { maxlength: `Máximo ${UBICACION_MAX} caracteres.` }
  };

  constructor() {
    // Al editar cualquier campo se descartan los errores que devolvió el servidor
    this.form.valueChanges.subscribe(() => {
      if (Object.keys(this.erroresServidor()).length > 0) {
        this.erroresServidor.set({});
      }
    });
  }

  /** Mensaje a mostrar bajo un campo (error del servidor o del cliente). */
  mensajeError(campo: CampoForm): string | null {
    const delServidor = this.erroresServidor()[campo];
    if (delServidor) return delServidor;

    const control = this.form.controls[campo];
    if (control.invalid && (control.touched || this.intentoEnvio())) {
      const clave = Object.keys(control.errors ?? {})[0];
      return this.mensajesCliente[campo][clave] ?? 'Valor no válido.';
    }
    return null;
  }

  /** Envío del formulario: valida, llama al servicio y refleja el resultado. */
  enviar(): void {
    this.intentoEnvio.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const ubicacion = valores.ubicacion.trim();
    const datos: NuevaAlerta = {
      tipoAlerta: valores.tipoAlerta as TipoAlerta,
      distanciaMetros: valores.distanciaMetros as number,
      severidad: valores.severidad as Severidad,
      ...(ubicacion ? { ubicacion } : {})
    };

    this.estado.set('enviando');
    this.errorGeneral.set(null);
    this.erroresServidor.set({});

    this.cylons.crearAlerta(datos).subscribe({
      next: creada => {
        this.alertaCreada.set(creada);
        this.estado.set('exito');
        this.voz.hablar(`Obstáculo reportado: ${creada.tipoAlerta} a ${creada.distanciaMetros} metros.`);
        this.form.reset();
        this.intentoEnvio.set(false);
      },
      error: err => {
        const detalle = describirError(err);
        this.estado.set('error');
        this.errorGeneral.set(detalle.mensaje);
        this.erroresServidor.set((detalle.errores ?? {}) as Partial<Record<CampoForm, string>>);
      }
    });
  }

  /** Vuelve al formulario vacío después de un envío exitoso. */
  reportarOtro(): void {
    this.alertaCreada.set(null);
    this.estado.set('inactivo');
  }
}
