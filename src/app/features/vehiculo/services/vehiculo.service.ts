import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehiculo } from '../models/vehiculo.model';


@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/vehiculos`;

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getOne(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
  }

  create(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculo);
  }

  update(id: number, vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.apiUrl}/${id}`, vehiculo);
  }

  delete(id: number): Observable<Vehiculo> {
    return this.http.delete<Vehiculo>(`${this.apiUrl}/${id}`);
  }
}
