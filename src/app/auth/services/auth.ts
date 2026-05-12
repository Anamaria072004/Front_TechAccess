import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginInterface } from '../interfaces/login';

export interface Module {
  id: number;
  name: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  modules: Module[];
}

export interface User {
  id: number;
  name: string;
  lastName: string;
  docType: string;
  docNumber: string;
  email: string;
  isActive: boolean;
  roles: Role[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/auth';

  private _authStatus = signal<AuthResponse | null>(null);

  public currentUser = computed(() => this._authStatus()?.user);
  public isAuthenticated = computed(() => !!this._authStatus());

  public userModules = computed(() => {
    const user = this._authStatus()?.user;
    return user ? user.roles.flatMap(r => r.modules.map(m => m.name)) : [];
  });

  constructor() {
    this.restoreAuth();
  }

  private restoreAuth(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    console.log('Restaurando auth:', { token: !!token, userStr: !!userStr });

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Usuario restaurado:', user);
        this._authStatus.set({
          access_token: token,
          user: user
        });
      } catch (e) {
        console.error('Error restaurando auth', e);
        this.logout();
      }
    }
  }

  // ← SOLO UN MÉTODO login()
  public login(credentials: LoginInterface): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        console.log('LOGIN RESPONSE:', response);
        console.log('USER:', response.user);

        this._authStatus.set(response);

        if (response.access_token) {
          localStorage.setItem('token', response.access_token);
          console.log('Token guardado');
        }

        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('Usuario guardado en localStorage:', JSON.parse(localStorage.getItem('user')!));
        } else {
          console.error('NO HAY USUARIO EN LA RESPUESTA');
        }
      })
    );
  }

  public logout(): void {
    this._authStatus.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.API_URL}/reset-password`, { token, newPassword });
  }

  public userRoles = computed(() => {
    const user = this._authStatus()?.user;
    return user ? user.roles.map(r => r.name.toUpperCase()) : [];
  });

  public isVigilante = computed(() => {
    return this.userRoles().includes('VIGILANTE');
  });

  public isAdmin = computed(() => {
    return this.userRoles().includes('ADMIN');
  });
}