import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DispositivoService } from './services/dispositivo.service';
import { AddDispositivoModalComponent } from './components/dispositivo-dialog';
import { Dispositivo } from './models/dispositivos.model';
import { DataTableComponent } from '@shared/components/data-table/data-table';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-dispositivos',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatSnackBarModule, MatDialogModule, DataTableComponent],
  templateUrl: './dispositivos.html',
  styleUrl: './dispositivos.scss',
})
export class DispositivosComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private dispositivoService = inject(DispositivoService);

  // Referencia al componente de la tabla de datos (#tabla en el HTML)
  @ViewChild('tabla') tabla?: DataTableComponent;

  // Guarda el valor de texto actual escrito por el usuario en el filtro
  filtroTexto: string = '';

  // Aplica el filtro sobre la tabla cuando el usuario digita en el buscador
  aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.filtroTexto = valor;
    if (this.tabla) {
      this.tabla.onFilterChange(event); // Llama al método de filtrado de la tabla compartida
    }
  }

  // Limpia el buscador y restablece los registros originales de la tabla
  limpiarFiltro(): void {
    this.filtroTexto = '';
    if (this.tabla) {
      this.tabla.clearFilter(); // Restablece el filtro interno de la tabla
    }
  }

  dispositivos: any[] = [];
  loading = false;
  // Definimos las columnas para la tabla general
  dispositivoColumns = [
    { key: 'usuarioNombre', label: 'Propietario', type: 'text' },
    { key: 'tipoDispositivo', label: 'Tipo', type: 'text' },
    { key: 'marca', label: 'Marca', type: 'text' },
    { key: 'color', label: 'Color', type: 'text' },
    // Para mostrar el nombre del usuario, el backend debe traer el objeto usuario
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.cargarDispositivos();
    });
  }

  cargarDispositivos(): void {
    this.loading = true;
    this.dispositivoService.getAll().subscribe({
      next: (res) => {
        const data = res.data || res;
        console.log('Datos del backend:', JSON.stringify(data, null, 2));

        this.dispositivos = data.map((d: any) => {
          console.log('Dispositivo individual:', d);

          return {
            ...d,
            usuarioNombre:
              d.usuario?.nombre ||
              d.usuario?.name ||
              d.nombreUsuario ||
              d.usuarioNombre ||
              `ID: ${d.usuarioId}` ||
              'Sin asignar',
          };
        });

        console.log('Dispositivos mapeados:', this.dispositivos);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      },
    });
  }

  deleteDispositivo(dispositivo: any): void {
    const id    = dispositivo.id;
    const marca = dispositivo.marca;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '95vw',
      maxWidth: '420px',
      data: {
        title:       'Eliminar Dispositivo',
        message:     `¿Deseas eliminar el dispositivo ${marca}?`,
        detail:      'Esta acción no se puede deshacer.',
        confirmText: 'Sí, eliminar',
        cancelText:  'Cancelar',
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.dispositivoService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Dispositivo eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.cargarDispositivos();
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.snackBar.open('No se pudo eliminar el dispositivo', 'Cerrar');
        },
      });
    });
  }

  editarDispositivo(dispositivo: any): void {
    // Transformar el usuario al formato que espera el diálogo
    const dataParaDialogo = {
      ...dispositivo,
      usuario: dispositivo.usuario
        ? {
            id: dispositivo.usuario.id,
            docNumber:
              dispositivo.usuario.docNumber ||
              dispositivo.usuario.documento ||
              dispositivo.usuario.cedula ||
              '',
            name: dispositivo.usuario.name || dispositivo.usuario.nombre || '',
            lastName: dispositivo.usuario.lastName || dispositivo.usuario.apellido || '',
          }
        : null,
    };

    console.log('Datos enviados al diálogo:', dataParaDialogo);

    const ref = this.dialog.open(AddDispositivoModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: dataParaDialogo,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        const dataActualizada = {
          tipoDispositivo: result.tipoDispositivo,
          marca: result.marca,
          color: result.color,
          usuarioId: Number(result.usuario.id),
        };

        this.dispositivoService.update(dispositivo.id, dataActualizada).subscribe({
          next: () => {
            this.snackBar.open('Dispositivo actualizado', 'Cerrar', { duration: 3000 });
            this.cargarDispositivos();
          },
          error: (err) => {
            console.error('Error al actualizar:', err);
            this.snackBar.open('Error al actualizar los datos', 'Cerrar');
          },
        });
      }
    });
  }

  openRegisterModal(): void {
    const ref = this.dialog.open(AddDispositivoModalComponent, {
      width: '500px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        //Le decimos a TypeScript que este objeto es un CreateDispositivoDto
        const dataParaGuardar = {
          tipoDispositivo: result.tipoDispositivo,
          marca: result.marca,
          color: result.color,
          usuarioId: Number(result.usuario.id),
        };

        this.dispositivoService.create(dataParaGuardar as any).subscribe({
          next: () => {
            this.snackBar.open('Dispositivo registrado', 'Cerrar', { duration: 3000 });
            this.cargarDispositivos();
          },
          error: (err) => {
            console.error('Error 400 detalle:', err.error);
            this.snackBar.open('Error al guardar', 'Cerrar');
          },
        });
      }
    });
  }
}
