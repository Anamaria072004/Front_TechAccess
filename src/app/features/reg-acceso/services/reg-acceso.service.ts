import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Acceso, CreateAccesoDto } from '../models/reg-acceso.model';
import { Usuario } from '@features/users/models/users.model'; // Asegura esta importación

@Injectable({
  providedIn: 'root'
})
export class RegAccesoService {
  // Ruta para los accesos
  private readonly API_URL = 'http://localhost:3000/api/reg-acceso'; 
  
  // Ruta espejo para consultar el documento en el módulo de usuarios
  private readonly USERS_API_URL = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  // POST: Crear el acceso
  crearAcceso(dto: CreateAccesoDto): Observable<Acceso> {
    return this.http.post<Acceso>(this.API_URL, dto);
  }

  // GET: Historial de accesos
  obtenerAccesos(): Observable<Acceso[]> {
    return this.http.get<Acceso[]>(this.API_URL);
  }

  // 💥 ESTE ES EL MÉTODO QUE CONECTA CON EL CONTROLLER DE LA FOTO
  buscarUsuarioPorDocumento(docNumber: string): Observable<Usuario> {
    // Apunta a: http://localhost:3000/api/users/documento/{docNumber}
    return this.http.get<Usuario>(`${this.USERS_API_URL}/documento/${docNumber}`);
  }

  eliminarAcceso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}