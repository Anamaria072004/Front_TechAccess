export interface Ficha {
  id: number;
  numficha: string;
  programa: string;
  nivelFormacion: string;
  jornada: string;
  estado: string;
  fechaInicio: string | Date;
  fechafin: string | Date;
}