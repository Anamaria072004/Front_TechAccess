import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Dispositivo } from '../models/dispositivos.model';

@Injectable({
  providedIn: 'root'
})
export class DispositivoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/dispositivos`;

  /**
   * Obtiene la lista de dispositivos con paginación
   */
  getAll(page: number = 1, limit: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Obtiene un solo dispositivo por su ID
   */
  getOne(id: number): Observable<Dispositivo> {
    return this.http.get<Dispositivo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene todos los dispositivos vinculados a un usuario específico
   */
  getByUser(usuarioId: number): Observable<Dispositivo[]> {
    return this.http.get<Dispositivo[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  /**
   * Crea un nuevo dispositivo. 
   */
  // En dispositivo.service.ts
  create(data: Dispositivo): Observable<Dispositivo> {
    return this.http.post<Dispositivo>(this.apiUrl, data);
  }

  /**
   * Actualiza datos parciales de un dispositivo
   */
  update(id: number, dispositivo: Partial<Dispositivo>): Observable<Dispositivo> {
    return this.http.patch<Dispositivo>(`${this.apiUrl}/${id}`, dispositivo);
  }

  /**
   * Elimina un dispositivo
   */
  delete(id: number, soft: boolean = true): Observable<any> {
    const params = new HttpParams().set('soft', soft.toString());
    return this.http.delete(`${this.apiUrl}/${id}`, { params });
  }
}
