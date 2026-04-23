import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsersService } from './users.service';
import { UsuarioDialogComponent } from './usuario-dialog';

// ── Interfaces ──────────────────────────────────────────────
export interface Role {
  id: number;
  name: string;
}

export interface Ficha {
  id: number;
  codigoFicha: string;
}

export interface Usuario {
  id: number;
  name: string;
  lastName: string;
  docType: string;
  docNumber: string;
  email: string;
  telephone: string | null;
  FamTelephone: string | null;
  state: 'activo' | 'inactivo' | 'suspendido';
  roles: Role[];
  fichas: Ficha | null;
}

// ── Componente ───────────────────────────────────────────────
@Component({
  selector: 'app-usuarios',
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
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class Users implements OnInit {

  usuarios: Usuario[] = [];
  loading = false;

  displayedColumns: string[] = [
    'nombre',
    'docType',
    'docNumber',
    'email',
    'telephone',
    'estado',
    'roles',
    'acciones',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private usersService: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // ── Carga ──────────────────────────────────────────────────
  cargarUsuarios(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.usersService.getAll().subscribe({
      next: (data) => {
        // Filtrar para ocultar aprendices en esta vista administrativa
        this.usuarios = data.filter((u: Usuario) => 
          !u.roles?.some(r => r.name.toUpperCase() === 'APRENDIZ')
        );
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Acciones de tabla ──────────────────────────────────────
  verVehiculos(usuario: Usuario): void {
    // Abre modal o navega a la vista de vehículos del usuario
    this.snackBar.open(
      `Vehículos de ${usuario.name} ${usuario.lastName}`,
      'Cerrar',
      { duration: 3000 }
    );
  }

  verDispositivos(usuario: Usuario): void {
    // Abre modal o navega a la vista de dispositivos del usuario
    this.snackBar.open(
      `Dispositivos de ${usuario.name} ${usuario.lastName}`,
      'Cerrar',
      { duration: 3000 }
    );
  }

  editarUsuario(usuario: Usuario): void {
    const ref = this.dialog.open(UsuarioDialogComponent, { 
      data: usuario, 
      width: '95vw',
      maxWidth: '1200px'
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.usersService.update(usuario.id, result).subscribe({
          next: () => {
            this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.cargarUsuarios();
          },
          error: (err) => {
            const msg = err.error?.message || 'Error al actualizar';
            this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
          }
        });
      }
    });

  }

  eliminarUsuario(usuario: Usuario): void {
    const confirmado = confirm(`¿Eliminar a ${usuario.name}?`);
    if (confirmado) {
      this.usersService.delete(usuario.id).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000, panelClass: ['snack-error'] });
          this.cargarUsuarios();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }

  abrirModalNuevo(): void {
    const ref = this.dialog.open(UsuarioDialogComponent, { 
      width: '95vw',
      maxWidth: '1200px'
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.usersService.create(result).subscribe({
          next: () => {
             this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 3000 });
             this.cargarUsuarios();
          },
          error: (err) => {
            const msg = err.error?.message || 'Error al crear usuario';
            this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
          }
        });
      }
    });
  }
}