import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RegAccesoService } from '../../services/reg-acceso.service';
import { Acceso } from '../../models/reg-acceso.model';
import { Usuario } from '@features/users/models/users.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reg-acceso-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reg-acceso-dialog.html',
  styleUrls: ['./reg-acceso-dialog.scss']
})
export class RegAccesoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RegAccesoDialogComponent>);
  private regAccesoService = inject(RegAccesoService);
  private cdr = inject(ChangeDetectorRef);

  accesoForm!: FormGroup;
  buscando = false;
  guardando = false;
  usuarioEncontrado: Usuario | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.accesoForm = this.fb.group({
      // Expresión regular estricta para garantizar que solo viajen enteros al ParseIntPipe
      documento: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      observacion: ['']
    });
  }

  buscarUsuario(): void {
    const documentoRaw = this.accesoForm.get('documento')?.value;
    console.log('[Manual Access Dialog] Iniciando búsqueda para documento raw:', documentoRaw);
    
    if (!documentoRaw || this.accesoForm.get('documento')?.invalid) {
      console.warn('[Manual Access Dialog] Búsqueda cancelada: formulario inválido o sin documento.');
      return;
    }

    // Convertimos a string y eliminamos cualquier espacio accidental
    const documento = String(documentoRaw).trim();
    console.log('[Manual Access Dialog] Buscando documento normalizado:', documento);

    this.buscando = true;
    this.usuarioEncontrado = null;
    this.errorMessage = '';
    this.cdr.detectChanges(); // Forzar spinner

    this.regAccesoService.buscarUsuarioPorDocumento(documento).subscribe({
      next: (usuario: Usuario) => {
        console.log('[Manual Access Dialog] Respuesta exitosa del servidor:', usuario);
        if (usuario) {
          this.usuarioEncontrado = usuario;
        } else {
          this.errorMessage = 'Usuario no registrado en el sistema.';
        }
        this.buscando = false;
        this.cdr.detectChanges(); // Forzar renderización de datos
      },
      error: (err: HttpErrorResponse) => {
        console.error('[Manual Access Dialog] Error en la petición HTTP:', err);
        
        // Controlamos el error 400 (Bad Request del ParseIntPipe) y el 404 (No encontrado)
        if (err.status === 400) {
          this.errorMessage = 'El servidor rechazó el formato. Ingrese un número de documento válido sin letras.';
        } else if (err.status === 404) {
          this.errorMessage = `El documento N° ${documento} no se encuentra registrado.`;
        } else {
          this.errorMessage = 'No se pudo conectar con el servidor de bases de datos.';
        }
        
        this.buscando = false;
        this.cdr.detectChanges(); // Forzar visualización de error
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  guardar(): void {
    if (this.accesoForm.invalid || !this.usuarioEncontrado) return;

    this.guardando = true;
    this.errorMessage = '';
    
    const payload = {
      usuarioId: this.usuarioEncontrado.id,
      observacion: this.accesoForm.get('observacion')?.value || 'Acceso manual'
    };

    this.regAccesoService.crearAcceso(payload).subscribe({
      next: (nuevoAcceso: Acceso) => {
        this.guardando = false;
        this.dialogRef.close(nuevoAcceso);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al guardar el acceso:', err);
        this.errorMessage = 'No se pudo registrar el acceso en el sistema.';
        this.guardando = false;
      }
    });
  }
}