import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // Añadido ChangeDetectorRef por seguridad

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { RolesService } from './services/roles.service';
import { RoleDialogComponent } from './components/role-dialog/role-dialog';
import { Role } from './models/roles.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatSnackBarModule, DataTableComponent],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss'],
})
export class RolesComponent implements OnInit {
  private rolesService = inject(RolesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef); // Para forzar el refresco si el spinner se pega

  roles: Role[] = [];
  loading: boolean = true;

  // Las llaves (key) deben ser EXACTAS a las del objeto Role (name, description)
  roleColumns = [
    { key: 'name', label: 'Nombre del Rol', type: 'text' },
    { key: 'description', label: 'Descripción', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.loading = true;
    this.rolesService.getAll().subscribe({
      next: (res: Role[]) => {
        this.roles = res ? [...res] : [];
        this.loading = false; // Detiene el spinner
        this.cdr.detectChanges(); // Asegura que Angular note que loading ya es false
      },
      error: (err) => {
        console.error('Error:', err);
        this.snackBar.open('Error al cargar roles', 'Cerrar', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  abrirModalNuevo(): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '500px',
      disableClose: true,
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.rolesService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Rol creado con éxito', 'Cerrar', { duration: 2000 });
            this.cargarRoles();
          },
          error: (err) => this.snackBar.open('Error al crear', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }

  editarRol(rol: Role): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '500px',
      disableClose: true,
      data: rol,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.rolesService.update(rol.id, result).subscribe({
          next: () => {
            this.snackBar.open('Rol actualizado', 'Cerrar', { duration: 2000 });
            this.cargarRoles();
          },
          error: (err) => this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }

  eliminarRol(rol: Role): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el rol "${rol.name}"?`)) {
      this.rolesService.delete(rol.id).subscribe({
        next: () => {
          this.snackBar.open('Rol eliminado', 'Cerrar', { duration: 2000 });
          this.cargarRoles();
        },
        error: (err) => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }),
      });
    }
  }
}
