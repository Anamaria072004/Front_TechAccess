import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

// Material 3 Imports
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LoginInterface } from '../interfaces/login';
import { Auth } from '../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    RouterLink
  ],
  templateUrl: './log-in.html',
  styleUrl: './log-in.scss',
})
export class LogIn {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  errorType: 'not_found' | 'wrong_password' | 'server' | '' = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /** Limpia el error cuando el usuario modifica algún campo */
  clearError() {
    this.errorMessage = '';
    this.errorType = '';
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const rawForm = this.loginForm.value as LoginInterface;
    this.isLoading = true;
    this.errorMessage = '';
    this.errorType = '';

    this.authService.login(rawForm).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges(); // fuerza la vista a actualizarse
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        if (err.status === 404 || err.status === 400) {
          this.errorType = 'not_found';
          this.errorMessage = 'No existe una cuenta con ese correo electrónico.';
        } else if (err.status === 401 || err.status === 403) {
          this.errorType = 'wrong_password';
          this.errorMessage = 'La contraseña ingresada es incorrecta.';
        } else if (err.status === 0) {
          this.errorType = 'server';
          this.errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
        } else {
          this.errorType = 'server';
          this.errorMessage = `Ocurrió un error inesperado (${err.status}). Intenta de nuevo.`;
        }
        this.cdr.detectChanges(); // muestra el mensaje inmediatamente
      }
    });
  }
}
