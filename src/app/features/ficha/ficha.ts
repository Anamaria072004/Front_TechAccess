import { Component, OnInit, inject, ChangeDetectorRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Componentes y Servicios
import { FichaService } from './services/ficha.service';
import { FichaDialogComponent } from './components/ficha-dialog';
import { DataTableComponent } from '@shared/components/data-table/data-table';
import { AprendicesModalComponent } from './components/aprendices/aprendices-modal';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Auth } from '../../core/services/auth';

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
  private auth = inject(Auth);

  isVigilante = this.auth.isVigilante;
  fichas: any[] = [];
  loading = signal(false);

  // Configuración de columnas dinámica basada en el rol
  fichaColumns = computed(() => {
    const isVig = this.isVigilante();
    const cols = [
      { key: 'numficha', label: 'Nº Ficha', type: 'text' },
      { key: 'programaInfo', label: 'Programa / Especialidad', type: 'text' },
      { key: 'jornada', label: 'Jornada', type: 'text' },
      { key: 'estado', label: 'Estado', type: 'text' },
      { key: 'vigencia', label: 'Vigencia', type: 'text' },
    ];
    cols.push({ key: 'actions', label: 'Acciones', type: 'actions' });
    return cols;
  });

  ngOnInit(): void {
    console.log('FichasComponent - ¿Es Vigilante?:', this.isVigilante());
    this.cargarFichas();
  }

  cargarFichas(): void {
    this.loading.set(true);
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

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error en API:', err);
        this.snackBar.open('Error al obtener la lista de fichas', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  abrirModalNueva(): void {
    const ref = this.dialog.open(FichaDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
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
      width: '750px',
      maxWidth: '95vw',
      data: { fichaId: ficha.id, numficha: ficha.numficha }
    });
  }

  editarFicha(ficha: any): void {
    const ref = this.dialog.open(FichaDialogComponent, {
      data: ficha,
      width: '600px',
      maxWidth: '95vw',
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
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '95vw',
      maxWidth: '420px',
      data: {
        title:       'Eliminar Ficha',
        message:     `¿Deseas eliminar la ficha Nº ${ficha.numficha}?`,
        detail:      'Esta acción no se puede deshacer.',
        icon:        'badge',
        confirmText: 'Sí, eliminar',
        cancelText:  'Cancelar',
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      // Borrado Físico: Pasamos false para que se borre de verdad y no solo se inactiva
      this.fichaService.delete(ficha.id, false).subscribe({
        next: () => {
          this.snackBar.open('Ficha eliminada', 'OK', { duration: 3000 });
          this.cargarFichas();
        },
        error: (err) => {
          console.error('Error borrando ficha:', err);
          this.snackBar.open('No se pudo eliminar la ficha. Puede que tenga aprendices asociados.', 'Cerrar', { duration: 5000 });
        }
      });
    });
  }
}
