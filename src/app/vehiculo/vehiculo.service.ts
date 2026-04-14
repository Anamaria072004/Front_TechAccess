import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/vehiculos';

  getAll(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl);
  }

  getOne(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
  }

  create(vehiculo: any): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculo);
  }

  update(id: number, vehiculo: any): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.apiUrl}/${id}`, vehiculo);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
