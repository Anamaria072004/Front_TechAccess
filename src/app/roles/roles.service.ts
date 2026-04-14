import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ModuleEntity {
  id: number;
  name: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  modules: ModuleEntity[];
}

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

  create(role: any): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  update(id: number, role: any): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/${id}`, role);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Métodos para módulos
  getModules(): Observable<ModuleEntity[]> {
    return this.http.get<ModuleEntity[]>(this.modulesUrl);
  }
}
