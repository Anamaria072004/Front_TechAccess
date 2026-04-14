import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RolesService, Role } from './roles.service';
import { RoleDialogComponent } from './role-dialog';

@Component({
  selector: 'app-roles',
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
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss']
})
export class RolesComponent implements OnInit {
  private rolesService = inject(RolesService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  roles: Role[] = [];
  loading = false;
  displayedColumns: string[] = ['name', 'description', 'modules', 'acciones'];

  ngOnInit() {
    this.cargarRoles();
  }

  cargarRoles() {
    this.loading = true;
    this.rolesService.getAll().subscribe({
      next: (res) => {
        this.roles = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Error al cargar roles', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalNuevo() {
    const ref = this.dialog.open(RoleDialogComponent, { width: '800px' });
    ref.afterClosed().subscribe(res => {
      if (res) {
        this.rolesService.create(res).subscribe({
          next: () => {
            this.snackBar.open('Rol creado correctamente', 'Cerrar', { duration: 3000 });
            this.cargarRoles();
          },
          error: () => this.snackBar.open('Error al crear rol', 'Cerrar', { duration: 3000 })
        });
      }
    });
  }

  editarRol(rol: Role) {
    const ref = this.dialog.open(RoleDialogComponent, { data: rol, width: '800px' });
    ref.afterClosed().subscribe(res => {
      if (res) {
        this.rolesService.update(rol.id, res).subscribe({
          next: () => {
            this.snackBar.open('Rol actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.cargarRoles();
          },
          error: () => this.snackBar.open('Error al actualizar rol', 'Cerrar', { duration: 3000 })
        });
      }
    });
  }

  eliminarRol(rol: Role) {
    if (confirm(`¿Está seguro de eliminar el rol "${rol.name}"?`)) {
      this.rolesService.delete(rol.id).subscribe({
        next: () => {
          this.snackBar.open('Rol eliminado', 'Cerrar', { duration: 3000 });
          this.cargarRoles();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }
}
