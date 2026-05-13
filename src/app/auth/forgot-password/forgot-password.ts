import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Material Imports (Esto es lo que evita los errores en el HTML)
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

// Tu servicio de Auth
import { Auth } from '../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})

export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);

  loading = false;
  messageSent = false; // Usaremos solo esta variable

  recoveryForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

onSubmit() {
  if (this.recoveryForm.valid) {
    this.loading = true;
    const email = this.recoveryForm.get('email')?.value;

    this.authService.forgotPassword(email!).subscribe({
      next: () => {
        // Primero apagamos el cargando y LUEGO activamos el mensaje
        this.loading = false;
        this.messageSent = true; 
        
        // Opcional: Si sigue demorando, puedes resetear el formulario 
        // para limpiar cualquier estado de validación pendiente
        this.recoveryForm.reset();
      },
      error: (err) => {
        this.loading = false;
        alert('Error: ' + (err.error?.message || 'Error al conectar con el servidor'));
      }
    });
  }
}
}