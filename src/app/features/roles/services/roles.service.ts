import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/roles.model';
import { Modulo } from '@features/modulo/models/modulo.model';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/roles';
  private modulesUrl = 'http://localhost:3000/api/modules';

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getOne(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  create(role: Omit<Role, 'id'>): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  update(id: number, role: Partial<Role>): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/${id}`, role);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Cambiado a getModules para que coincida con la llamada de tu Dialog y Componente
  getModules(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(this.modulesUrl);
  }
}