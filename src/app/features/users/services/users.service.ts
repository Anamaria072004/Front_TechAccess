import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../../../shared/models/user.model'; // Nueva ruta limpia

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  // Tip: podrías mover estas URLs a un archivo de environments más adelante
  private apiUrl = 'http://localhost:3000/api/users';
  private rolesUrl = 'http://localhost:3000/api/roles';

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getOne(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  // Usamos Partial<Usuario> para permitir enviar solo algunos campos al editar
  create(user: Omit<Usuario, 'id'>): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, user);
  }

  update(id: number, user: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.rolesUrl);
  }
}