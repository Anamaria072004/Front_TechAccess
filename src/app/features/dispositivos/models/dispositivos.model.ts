// Ajusta la ruta según tu estructura

import { Usuario } from "@features/users/models/users.model";

export interface Dispositivo {
  id: number;
  tipoDispositivo: string;
  marca: string;
  color: string;
  usuario: Usuario;
}
