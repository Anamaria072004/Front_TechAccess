import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HttpErrorResponse } from '@angular/common/http';
import { RegAccesoService } from '../services/reg-acceso.service';
import { Acceso } from '../models/reg-acceso.model';

export interface ConfirmarSalidaData {
  usuarioId: number;
  usuarioNombre: string;
  documento: string;
}

@Component({
  selector: 'app-confirmar-salida-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './confirmar-salida-dialog.html',
  styleUrls: ['./confirmar-salida-dialog.scss']
})
export class ConfirmarSalidaDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmarSalidaDialogComponent>);
  private regAccesoService = inject(RegAccesoService);

  // ✅ CORREGIDO: Usar MAT_DIALOG_DATA para recibir datos
  public data: ConfirmarSalidaData = inject(MAT_DIALOG_DATA);

  guardando = false;

  confirmar(): void {
    this.guardando = true;

    const payload = {
      usuarioId: this.data.usuarioId,
      observacion: 'Salida confirmada'
    };

    this.regAccesoService.crearAcceso(payload).subscribe({
      next: (acceso: Acceso) => {
        this.guardando = false;
        this.dialogRef.close(acceso);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al registrar salida:', err);
        this.guardando = false;
        this.dialogRef.close(null);
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}