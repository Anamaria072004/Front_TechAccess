import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsersService } from './users.service';
import { AprendizDialogComponent } from './aprendiz-dialog';
import { Usuario } from './users';

@Component({
  selector: 'app-aprendices',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './aprendices.html',
  styleUrls: ['./aprendices.scss']
})
export class Aprendices implements OnInit {
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  aprendices: Usuario[] = [];
  loading = false;
  displayedColumns: string[] = ['nombre', 'documento', 'ficha', 'estado', 'acciones'];

  ngOnInit() {
    this.cargarAprendices();
  }

  cargarAprendices() {
    this.loading = true;
    this.cdr.detectChanges();
    this.usersService.getAll().subscribe({
      next: (data) => {
        // Filtrar para mostrar solo los que tienen el rol de APRENDIZ
        this.aprendices = data.filter((u: Usuario) => 
          u.roles?.some(r => r.name.toUpperCase() === 'APRENDIZ')
        );
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Error al conectar con la base de datos', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalNuevo() {
    const ref = this.dialog.open(AprendizDialogComponent, { 
      width: '95vw',
      maxWidth: '1200px'
    });
    ref.afterClosed().subscribe(res => {
      if (res) {
        this.usersService.create(res).subscribe({
          next: () => {
            this.snackBar.open('Aprendiz registrado exitosamente', 'OK', { duration: 3000 });
            this.cargarAprendices();
          },
          error: (err) => {
            const msg = err.error?.message || 'Error al registrar aprendiz';
            this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
          }
        });
      }
    });
  }

  editarAprendiz(aprendiz: Usuario) {
    const ref = this.dialog.open(AprendizDialogComponent, { 
      data: aprendiz,
      width: '95vw',
      maxWidth: '1200px'
    });
    ref.afterClosed().subscribe(res => {
      if (res) {
        this.usersService.update(aprendiz.id, res).subscribe({
          next: () => {
            this.snackBar.open('Datos actualizados', 'OK', { duration: 3000 });
            this.cargarAprendices();
          },
          error: (err) => {
            const msg = err.error?.message || 'Error al actualizar';
            this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
          }
        });
      }
    });
  }

  eliminarAprendiz(aprendiz: Usuario) {
    if (confirm(`¿Eliminar al aprendiz ${aprendiz.name}?`)) {
      this.usersService.delete(aprendiz.id).subscribe({
        next: () => {
          this.snackBar.open('Aprendiz eliminado', 'OK', { duration: 3000 });
          this.cargarAprendices();
        },
        error: () => this.snackBar.open('Error al eliminar', 'error', { duration: 3000 })
      });
    }
  }
}
