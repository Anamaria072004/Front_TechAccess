import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { Auth } from '../../core/services/auth'; // Verifica que la ruta a tu servicio sea esta

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPasswordComponent implements OnInit {
  // Inyecciones modernas con inject()
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(Auth);

  token: string | null = null;
  hide = true; // Controla si se ve la contraseña o no

  // Formulario reactivo
  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    // Leemos el token de la URL: localhost:4200/auth/reset-password?token=XYZ...
    this.token = this.route.snapshot.queryParamMap.get('token');
    
    if (!this.token) {
      alert('Enlace no válido o incompleto. Solicita uno nuevo.');
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  onReset() {
    if (this.resetForm.valid && this.token) {
      const newPassword = this.resetForm.value.password;
      
      this.authService.resetPassword(this.token, newPassword!).subscribe({
        next: () => {
          alert('¡Tu contraseña ha sido actualizada correctamente!');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.error(err);
          alert('Error: ' + (err.error?.message || 'No se pudo actualizar la contraseña'));
        }
      });
    }
  }
}
