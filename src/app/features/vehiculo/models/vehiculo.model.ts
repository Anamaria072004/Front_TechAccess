export interface Vehiculo {
  id: number;
  placa: string;
  tipoVehiculo: string;
  marca: string;
  color: string;
  modelo: string;
  usuario?: {
    id: number;
    name: string;
    lastName: string;
  };
}