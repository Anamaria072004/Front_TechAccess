// src/app/shared/models/user.model.ts

export interface Ficha {
  id: number;
  codigoFicha: string;
}

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
}
export interface Modulo {
  id: number;
  name: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  modules: Modulo[]; // Relación directa con los módulos
}