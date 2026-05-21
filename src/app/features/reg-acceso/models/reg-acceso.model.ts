import { Usuario } from '@features/users/models/users.model';

export interface Acceso {
  id?: number;
  horaFecha?: Date;
  accion: boolean;
  observacion?: string;
  usuarioId: number;
  usuario?: Usuario;
}

export interface CreateAccesoDto {
  observacion?: string;
  usuarioId: number;
}