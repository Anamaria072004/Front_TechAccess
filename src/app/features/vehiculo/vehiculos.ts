import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddVehiculoModalComponent } from './components/vehiculo-dialog';
import { VehiculoService } from './services/vehiculo.service';
import { Vehiculo } from './models/vehiculo.model';
import { DataTableComponent } from '@shared/components/data-table/data-table';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-vehiculo',
  standalone: true,
  imports: [
    MatButtonModule, 
    MatIconModule, 
    MatSnackBarModule, 
    MatDialogModule, 
    DataTableComponent // Importamos el componente de tabla genérico
  ],
  templateUrl: './vehiculo.html',
  styleUrl: './vehiculo.scss',
})
export class VehiculosComponent implements OnInit {
  private vehiculoService = inject(VehiculoService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  vehiculos: any[] = []; // Cambiamos dataSource por vehiculos para mayor claridad
  loading = false;

  // Definimos las columnas siguiendo el esquema del componente data-table
  vehiculoColumns = [
    { key: 'placa', label: 'Placa', type: 'text' },
    { key: 'infoVehiculo', label: 'Información', type: 'text' }, // Marca + Modelo
    { key: 'usuarioNombre', label: 'Propietario', type: 'text' },
    { key: 'color', label: 'Color', type: 'colorCircle'},
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  ngOnInit(): void {
    // Pequeño timeout para asegurar que el ciclo de vida inicial de Angular se complete
    setTimeout(() => {
      this.loadVehiculos();
    });
  }

  loadVehiculos(): void {
    this.loading = true;
    this.vehiculoService.getAll().subscribe({
      next: (res) => {
        const data = res.data || res;
        // Mapeamos los datos para que coincidan con las 'keys' de las columnas
        this.vehiculos = data.map((v: any) => ({
          ...v,
          infoVehiculo: `${v.marca} ${v.modelo || ''}`,
          usuarioNombre: v.usuario?.nombre || v.usuario?.name || 'Sin asignar'
        }));

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Error al obtener la lista de vehículos', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(AddVehiculoModalComponent, {
      width: '650px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((res) => {
      if (res) {
        this.vehiculoService.create(res).subscribe({
          next: () => {
            this.snackBar.open('Vehículo registrado con éxito', 'OK', { duration: 3000 });
            this.loadVehiculos();
          },
          error: () =>
            this.snackBar.open('Error al registrar el vehículo', 'Reintentar', { duration: 3000 }),
        });
      }
    });
  }

  editarVehiculo(vehiculo: any): void {
    const ref = this.dialog.open(AddVehiculoModalComponent, {
      data: vehiculo,
      width: '650px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((res) => {
      if (res) {
        this.vehiculoService.update(vehiculo.id, res).subscribe({
          next: () => {
            this.snackBar.open('Datos actualizados correctamente', 'OK', { duration: 3000 });
            this.loadVehiculos();
          },
          error: () =>
            this.snackBar.open('Error al actualizar datos', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }

  deleteVehiculo(vehiculo: any): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '95vw',
      maxWidth: '420px',
      data: {
        title:       'Eliminar Vehículo',
        message:     `¿Deseas eliminar el vehículo con placa ${vehiculo.placa}?`,
        detail:      'Esta acción no se puede deshacer.',
        icon:        'directions_car',
        confirmText: 'Sí, eliminar',
        cancelText:  'Cancelar',
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.vehiculoService.delete(vehiculo.id).subscribe({
        next: () => {
          this.snackBar.open('Vehículo eliminado correctamente', 'Limpiar', { duration: 3000 });
          this.loadVehiculos();
        },
        error: () =>
          this.snackBar.open('Error al intentar eliminar el vehículo', 'Cerrar', { duration: 3000 }),
      });
    });
  }
}
