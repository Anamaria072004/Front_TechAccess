import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class FichaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/ficha';

  getAll(page: number = 1, limit: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('includeInactivas', 'true');
    return this.http.get<any>(this.apiUrl, { params });
  }

  getOne(id: number): Observable<Ficha> {
    return this.http.get<Ficha>(`${this.apiUrl}/${id}`);
  }

  create(ficha: any): Observable<Ficha> {
    return this.http.post<Ficha>(this.apiUrl, ficha);
  }

  update(id: number, ficha: any): Observable<Ficha> {
    return this.http.patch<Ficha>(`${this.apiUrl}/${id}`, ficha);
  }

  delete(id: number, soft: boolean = true): Observable<any> {
    const params = new HttpParams().set('soft', soft.toString());
    return this.http.delete(`${this.apiUrl}/${id}`, { params });
  }

  getAprendices(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/aprendices`);
  }
}
