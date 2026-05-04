import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VehiculoDialogComponent } from './components/vehiculo-dialog';
import { VehiculoService } from './services/vehiculo.service';
import { Vehiculo } from './models/vehiculo.model';

@Component({
  selector: 'app-vehiculo',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './vehiculo.html',
  styleUrl: './vehiculo.scss'
})export class VehiculosComponent implements OnInit {
  private vehiculoService = inject(VehiculoService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  dataSource: Vehiculo[] = [];
  loading = false;
  displayedColumns: string[] = ['placa', 'info', 'usuario', 'acciones'];

  ngOnInit(): void {
    this.loadVehiculos();
  }

  loadVehiculos(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.vehiculoService.getAll().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Error al obtener la lista de vehículos', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(VehiculoDialogComponent, {
      width: '95vw',
      maxWidth: '1200px'
    });
    ref.afterClosed().subscribe(res => {
      if (res) {
        this.vehiculoService.create(res).subscribe({
          next: () => {
            this.snackBar.open('Vehículo registrado con éxito', 'OK', { duration: 3000 });
            this.loadVehiculos();
          },
          error: () => this.snackBar.open('Error al registrar el vehículo', 'Reintentar', { duration: 3000 })
        });
      }
    });
  }

  openEditDialog(vehiculo: Vehiculo): void {
    const ref = this.dialog.open(VehiculoDialogComponent, {
      data: vehiculo,
      width: '95vw',
      maxWidth: '1200px'
    });
    ref.afterClosed().subscribe(res => {
      if (res) {
        this.vehiculoService.update(vehiculo.id, res).subscribe({
          next: () => {
            this.snackBar.open('Datos actualizados correctamente', 'OK', { duration: 3000 });
            this.loadVehiculos();
          },
          error: () => this.snackBar.open('Error al actualizar datos', 'Cerrar', { duration: 3000 })
        });
      }
    });
  }

  deleteVehiculo(id: number): void {
    if (confirm('¿Está seguro de querer eliminar este vehículo del sistema?')) {
      this.vehiculoService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Vehículo eliminado correctamente', 'Limpiar', { duration: 3000 });
          this.loadVehiculos();
        },
        error: () => this.snackBar.open('Error al intentar eliminar el vehículo', 'Cerrar', { duration: 3000 })
      });
    }
  }
}