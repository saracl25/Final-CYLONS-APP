/**
 * Modelo: Usuario
 * Perfil ligero de la persona asistida; alimenta la barra de estado.
 */
export interface Usuario {
  nombre: string;
  /** Nivel de asistencia configurado (ej. "Baja visión"). */
  nivelAsistencia: string;
  ciudad: string;
}
