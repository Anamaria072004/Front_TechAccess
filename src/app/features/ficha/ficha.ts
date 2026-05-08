import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FichaDialogComponent } from './components/ficha-dialog';
import { FichaService } from './services/ficha.service';
import { Ficha } from './models/ficha.model';

@Component({
  selector: 'app-fichas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  templateUrl: './ficha.html',
  styleUrls: ['./ficha.scss'],
})
export class FichasComponent implements OnInit {
  private fichaService = inject(FichaService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  fichas: Ficha[] = [];
  loading = false;
  displayedColumns: string[] = ['numficha', 'programa', 'jornada', 'estado', 'fechas', 'acciones'];
  
  // Expansión
  expandedElement: Ficha | null = null;
  aprendicesPorFicha: { [key: number]: any[] } = {};
  loadingAprendices: { [key: number]: boolean } = {};

  ngOnInit() {
    this.cargarFichas();
  }

  toggleRow(element: Ficha) {
    if (this.expandedElement === element) {
      this.expandedElement = null;
    } else {
      this.expandedElement = element;
      // Cargar aprendices si no están ya en memoria local
      if (!this.aprendicesPorFicha[element.id]) {
        this.cargarAprendicesDeFicha(element.id);
      }
    }
  }

  cargarAprendicesDeFicha(fichaId: number) {
    this.loadingAprendices[fichaId] = true;
    this.fichaService.getAprendices(fichaId).subscribe({
      next: (res) => {
        this.aprendicesPorFicha[fichaId] = res;
        this.loadingAprendices[fichaId] = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Error al cargar la lista de aprendices', 'OK', { duration: 3000 });
        this.loadingAprendices[fichaId] = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarFichas() {
    this.loading = true;
    this.fichaService.getAll().subscribe({
      next: (res) => {
        // El backend devuelve paginación, extraemos la data
        this.fichas = res.data || res; 
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Error al conectar con el servidor', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalNueva() {
    const ref = this.dialog.open(FichaDialogComponent, { 
      width: '95vw',
      maxWidth: '1200px',
      maxHeight: 'none',
      panelClass: 'custom-dialog-container'
    });
    ref.afterClosed().subscribe(res => {
      if (res) {
        this.fichaService.create(res).subscribe({
          next: () => {
            this.snackBar.open('Ficha creada correctamente', 'OK', { duration: 3000 });
            this.cargarFichas();
          },
          error: () => this.snackBar.open('Error al crear ficha', 'OK', { duration: 3000 })
        });
      }
    });
  }

  editarFicha(ficha: Ficha) {
    const ref = this.dialog.open(FichaDialogComponent, { 
      data: ficha, 
      width: '95vw',
      maxWidth: '1200px',
      maxHeight: 'none',
      panelClass: 'custom-dialog-container'
    });
    ref.afterClosed().subscribe(res => {
      if (res) {
        this.fichaService.update(ficha.id, res).subscribe({
          next: () => {
            this.snackBar.open('Ficha actualizada correctamente', 'OK', { duration: 3000 });
            this.cargarFichas();
          },
          error: () => this.snackBar.open('Error al actualizar ficha', 'OK', { duration: 3000 })
        });
      }
    });
  }

  eliminarFicha(ficha: Ficha) {
    if (confirm(`¿Eliminar la ficha ${ficha.numficha}?`)) {
      this.fichaService.delete(ficha.id).subscribe({
        next: () => {
          this.snackBar.open('Ficha eliminada', 'OK', { duration: 3000 });
          this.cargarFichas();
        },
        error: () => this.snackBar.open('Error al eliminar', 'OK', { duration: 3000 })
      });
    }
  }
}