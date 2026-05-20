import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, catchError, of } from 'rxjs'; // ← IMPORTS CORREGIDOS

import { RegAccesoDialogComponent } from './components/reg-acceso-dialog/reg-acceso-dialog';
import { RegAccesoService } from './services/reg-acceso.service';
import { Acceso } from './models/reg-acceso.model';
import { DataTableComponent } from '@shared/components/data-table/data-table';

@Component({
  selector: 'app-reg-acceso',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DataTableComponent
  ],
  templateUrl: './reg-acceso.html',
  styleUrls: ['./reg-acceso.scss']
})
export class RegAccesoComponent implements OnInit {
  accesosRecientes: any[] = [];
  codigoBarras: string = '';
  isLoading: boolean = false;
  isLoadingTable: boolean = false;
  tableError: string | null = null;
  mostrarTabla: boolean = false;

  tableColumns = [
    { key: 'usuarioNombre', label: 'Usuario', type: 'text' },
    { key: 'documento', label: 'Documento', type: 'text' },
    { key: 'horaFecha', label: 'Fecha/Hora', type: 'date' },
    { key: 'tipoAcceso', label: 'Tipo', type: 'text' },
    { key: 'observacion', label: 'Observación', type: 'text' }
  ];

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private regAccesoService: RegAccesoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.isLoadingTable = true;
    this.mostrarTabla = false;
    this.tableError = null;

    this.regAccesoService.obtenerAccesos().pipe(
      finalize(() => {
        this.isLoadingTable = false;
        this.mostrarTabla = true;
        this.cdr.detectChanges();
      }),
      catchError((err: any) => {
        console.error('[RegAcceso] Error:', err);
        this.tableError = 'Error al cargar los registros.';
        this.snackBar.open('Error al cargar el historial', 'Cerrar', { duration: 4000 });
        return of([]);
      })
    ).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          this.accesosRecientes = [];
          return;
        }

        this.accesosRecientes = data.map(acceso => ({
          ...acceso,
          usuarioNombre: acceso.usuario 
            ? `${acceso.usuario.name} ${acceso.usuario.lastName}` 
            : `Usuario ${acceso.usuarioId}`,
          documento: acceso.usuario?.docNumber || '-',
          tipoAcceso: this.getTipoAccesoLabel(acceso.accion),
          horaFecha: acceso.horaFecha
        }));
      }
    });
  }

  abrirDialogo(): void {
    const dialogRef = this.dialog.open(RegAccesoDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const tipo = result.accion ? 'Entrada' : 'Salida';
        const usuarioName = result.usuario ? `${result.usuario.name} ${result.usuario.lastName}` : 'Usuario';
        this.snackBar.open(`Registro exitoso: ${tipo} de ${usuarioName}`, 'Cerrar', { duration: 4000 });
        this.cargarHistorial();
      }
    });
  }

  procesarCodigoBarras(): void {
    const documento = this.codigoBarras.trim();
    if (!documento) return;

    this.isLoading = true;

    this.regAccesoService.buscarUsuarioPorDocumento(documento).subscribe({
      next: (usuario) => {
        if (!usuario || !usuario.id) {
          this.snackBar.open('Usuario no registrado.', 'Cerrar', { duration: 4000 });
          this.isLoading = false;
          return;
        }

        const payload = { 
          usuarioId: usuario.id, 
          observacion: 'Acceso por código de barras' 
        };

        this.regAccesoService.crearAcceso(payload).subscribe({
          next: (acceso: Acceso) => {
            const tipo = acceso.accion ? 'Entrada' : 'Salida';
            this.snackBar.open(`Registro exitoso: ${tipo} de ${usuario.name} ${usuario.lastName}`, 'Cerrar', { duration: 4000 });
            this.codigoBarras = '';
            this.isLoading = false;
            this.cargarHistorial();
          },
          error: (err) => {
            this.snackBar.open('Error al registrar el acceso.', 'Cerrar', { duration: 4000 });
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        if (err.status === 404) {
          this.snackBar.open(`El documento N° ${documento} no se encuentra registrado.`, 'Cerrar', { duration: 4000 });
        } else {
          this.snackBar.open('Error al conectar con el servidor.', 'Cerrar', { duration: 4000 });
        }
        this.isLoading = false;
      }
    });
  }

  getTipoAccesoLabel(accion: boolean): string {
    return accion ? 'Entrada' : 'Salida';
  }
}