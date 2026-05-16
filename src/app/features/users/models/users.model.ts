import { Dispositivo } from "@features/dispositivos/models/dispositivos.model";
import { Ficha } from "@features/ficha/models/ficha.model";
import { Role } from "@features/roles/models/roles.model";

export interface Usuario {
  id: number;
  name: string;
  lastName: string;
  docType: string;
  docNumber: string;
  email: string;
  telephone: string | null;
  FamTelephone: string | null;
  state: 'activo' | 'inactivo' | 'suspendido';
  roles: Role[];
  fichas: Ficha | null;
  dispositivos?: Dispositivo[];
}
