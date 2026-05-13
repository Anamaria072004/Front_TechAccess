import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Componentes y Servicios
import { FichaService } from './services/ficha.service';
import { FichaDialogComponent } from './components/ficha-dialog';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { AprendicesModalComponent } from './components/aprendices-modal/aprendices-modal'; // Crea este para el modal

@Component({
  selector: 'app-fichas',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    DataTableComponent
  ],
  templateUrl: './ficha.html',
  styleUrl: './ficha.scss'
})
export class FichasComponent implements OnInit {
  private fichaService = inject(FichaService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  fichas: any[] = [];
  loading = false;

  // Configuración de columnas para la tabla genérica
  fichaColumns = [
    { key: 'numficha', label: 'Nº Ficha', type: 'text' },
    { key: 'programaInfo', label: 'Programa / Especialidad', type: 'text' },
    { key: 'jornada', label: 'Jornada', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'text' },
    { key: 'vigencia', label: 'Vigencia', type: 'text' },
    { key: 'actions', label: 'Gestión', type: 'actions' },
  ];

  ngOnInit(): void {
    this.cargarFichas();
  }

  cargarFichas(): void {
    this.loading = true;
    this.fichaService.getAll().subscribe({
      next: (res: any) => {
        // CORRECCIÓN CRÍTICA: Accedemos a res.data porque el API devuelve un objeto paginado
        const listaFichas = res.data || [];

        this.fichas = listaFichas.map((f: any) => ({
          ...f,
          // Mapeo para mostrar Programa y Nivel en una sola celda
          programaInfo: `${f.programa} (${f.nivelFormacion || 'N/A'})`,
          // Mapeo para mostrar el rango de fechas formateado
          vigencia: `${new Date(f.fechaInicio).toLocaleDateString()} - ${new Date(f.fechafin).toLocaleDateString()}`
        }));

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error en API:', err);
        this.snackBar.open('Error al obtener la lista de fichas', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalNueva(): void {
    const ref = this.dialog.open(FichaDialogComponent, {
      width: '95vw',
      maxWidth: '800px',
    });

    ref.afterClosed().subscribe((res) => {
      if (res) {
        this.fichaService.create(res).subscribe({
          next: () => {
            this.snackBar.open('Ficha registrada con éxito', 'OK', { duration: 3000 });
            this.cargarFichas();
          },
          error: () => this.snackBar.open('Error al registrar la ficha', 'Cerrar')
        });
      }
    });
  }

  verAprendices(ficha: any): void {
    // Aquí abres el modal con la lista de aprendices
    this.dialog.open(AprendicesModalComponent, {
      width: '95vw',
      maxWidth: '900px',
      data: { fichaId: ficha.id, numficha: ficha.numficha }
    });
  }

  editarFicha(ficha: any): void {
    const ref = this.dialog.open(FichaDialogComponent, {
      data: ficha,
      width: '95vw',
      maxWidth: '800px',
    });

    ref.afterClosed().subscribe((res) => {
      if (res) {
        this.fichaService.update(ficha.id, res).subscribe({
          next: () => {
            this.snackBar.open('Datos actualizados correctamente', 'OK', { duration: 3000 });
            this.cargarFichas();
          },
          error: () => this.snackBar.open('Error al actualizar datos', 'Cerrar')
        });
      }
    });
  }

  eliminarFicha(ficha: any): void {
    if (confirm(`¿Está seguro de eliminar la ficha ${ficha.numficha}?`)) {
      this.fichaService.delete(ficha.id).subscribe({
        next: () => {
          this.snackBar.open('Ficha eliminada', 'OK', { duration: 3000 });
          this.cargarFichas();
        },
        error: () => this.snackBar.open('No se pudo eliminar la ficha', 'Cerrar')
      });
    }
  }
}