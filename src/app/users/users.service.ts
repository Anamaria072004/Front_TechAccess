import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from './users';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/users';
  private rolesUrl = 'http://localhost:3000/api/roles';

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getOne(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  create(user: any): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, user);
  }

  update(id: number, user: any): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.rolesUrl);
  }
}
