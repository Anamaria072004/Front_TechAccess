export interface Role {
  id: number;
  name: string;
}

export interface DialogModeConfig {
  vigilanteMode: boolean;
  title?: string;
  saveButtonText?: string;
  simplifiedMode?: boolean;
  isAdmin?: boolean; 
  readonly?: boolean;
}

export interface UserData {
  id?: number;
  name: string;
  lastName: string;
  docType: string;
  docNumber: string;
  email: string;
  telephone?: string | null;
  FamTelephone?: string | null;
  state: string;
  isActive?: boolean;
  password?: string;
  roles?: Role[];      // Lo que recibes del backend (objetos)
  roleIds?: number[];  // Lo que envías al backend (IDs)
}

export interface DialogData extends DialogModeConfig {
  user?: UserData;
}