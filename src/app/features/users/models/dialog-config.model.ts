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
}

// Interfaz que coincide con tu Usuario real + campos opcionales del formulario
export interface DialogData extends DialogModeConfig {
  user?: {
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
    roles?: Role[];
  };
}