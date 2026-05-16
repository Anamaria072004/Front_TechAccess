import { Modulo } from "@features/modulo/models/modulo.model";


export interface Role {
  id: number;
  name: string;
  description: string;
  modules: Modulo[]; 
}
