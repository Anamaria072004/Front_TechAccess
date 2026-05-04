import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Importación con la ruta correcta
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';

import { UsersService } from './services/users.service'; 
import { UsuarioDialogComponent } from './components/usuario-dialog/usuario-dialog';
import { Usuario } from './models/users.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    DataTableComponent // Nombre único y corregido
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class UsersComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: any[] = [];
  loading = false;

  // Configuración de columnas compatible con el @switch de tu data-table
  userColumns = [
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text' },
    { key: 'docType', label: 'Tipo doc.', type: 'text' },
    { key: 'docNumber', label: 'N° documento', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'state', label: 'Estado', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' } // Activará el @case('actions')
  ];

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data
          .filter((u: Usuario) => !u.roles?.some(r => r.name.toUpperCase() === 'APRENDIZ'))
          .map((u: Usuario) => ({
            ...u,
            nombreCompleto: `${u.name} ${u.lastName || ''}`
          }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalNuevo(): void {
    const ref = this.dialog.open(UsuarioDialogComponent, { width: '95vw', maxWidth: '1200px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.usersService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Usuario creado', 'Cerrar', { duration: 3000 });
            this.cargarUsuarios();
          }
        });
      }
    });
  }

  editarUsuario(usuario: any): void {
    const ref = this.dialog.open(UsuarioDialogComponent, { data: usuario, width: '95vw', maxWidth: '1200px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.usersService.update(usuario.id, result).subscribe({
          next: () => {
            this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
            this.cargarUsuarios();
          }
        });
      }
    });
  }

  eliminarUsuario(usuario: any): void {
    if (confirm(`¿Eliminar a ${usuario.name}?`)) {
      this.usersService.delete(usuario.id).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        }
      });
    }
  }
}