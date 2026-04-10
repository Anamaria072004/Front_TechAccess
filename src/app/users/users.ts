import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
    'id',
    'nombre',
    'docType',
    'docNumber',
    'email',
    'telephone',
    'famTelephone',
    'estado',
    'roles',
    'ficha',
    'acciones',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // ── Carga ──────────────────────────────────────────────────
  cargarUsuarios(): void {
    this.loading = true;

    // Reemplaza esto con tu servicio real, ej:
    // this.usuarioService.getAll().subscribe({ ... })
    setTimeout(() => {
      this.usuarios = [
        {
          id: 1,
          name: 'Carlos',
          lastName: 'Mendoza',
          docType: 'CC',
          docNumber: '1023456789',
          email: 'cmendoza@sena.edu.co',
          telephone: '3101234567',
          FamTelephone: '3209876543',
          state: 'activo',
          roles: [{ id: 1, name: 'Aprendiz' }, { id: 2, name: 'Monitor' }],
          fichas: { id: 1, codigoFicha: '2896745' },
        },
        {
          id: 2,
          name: 'Luisa',
          lastName: 'Fernández',
          docType: 'TI',
          docNumber: '1012345678',
          email: 'lfernandez@sena.edu.co',
          telephone: '3154567890',
          FamTelephone: null,
          state: 'activo',
          roles: [{ id: 3, name: 'Instructor' }],
          fichas: null,
        },
        {
          id: 3,
          name: 'Andrés',
          lastName: 'Torres',
          docType: 'CC',
          docNumber: '80123456',
          email: 'atorres@correo.co',
          telephone: null,
          FamTelephone: '3123456789',
          state: 'inactivo',
          roles: [],
          fichas: { id: 2, codigoFicha: '2745120' },
        },
        {
          id: 4,
          name: 'Valentina',
          lastName: 'Ríos',
          docType: 'CE',
          docNumber: 'E-456789',
          email: 'vrios@correo.com',
          telephone: '3187654321',
          FamTelephone: '3201234567',
          state: 'suspendido',
          roles: [{ id: 4, name: 'Coordinador' }],
          fichas: null,
        },
        {
          id: 5,
          name: 'Miguel',
          lastName: 'Salcedo',
          docType: 'CC',
          docNumber: '79887654',
          email: 'msalcedo@sena.edu.co',
          telephone: '3006543210',
          FamTelephone: null,
          state: 'activo',
          roles: [{ id: 1, name: 'Aprendiz' }],
          fichas: { id: 1, codigoFicha: '2896745' },
        },
      ];
      this.loading = false;
    }, 800);
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
    // Ejemplo: abrir un MatDialog con formulario de edición
    // const ref = this.dialog.open(EditarUsuarioDialogComponent, { data: usuario });
    // ref.afterClosed().subscribe(result => { if (result) this.cargarUsuarios(); });
    this.snackBar.open(
      `Editando a ${usuario.name} ${usuario.lastName}`,
      'Cerrar',
      { duration: 3000 }
    );
  }

  eliminarUsuario(usuario: Usuario): void {
    // Ejemplo: confirmar antes de eliminar
    // const confirmado = confirm(`¿Eliminar a ${usuario.name}?`);
    // if (confirmado) this.usuarioService.delete(usuario.id).subscribe(...)
    this.snackBar.open(
      `Eliminando a ${usuario.name} ${usuario.lastName}`,
      'Cerrar',
      { duration: 3000, panelClass: ['snack-error'] }
    );
  }

  abrirModalNuevo(): void {
    // Ejemplo: abrir un MatDialog con formulario de creación
    // const ref = this.dialog.open(NuevoUsuarioDialogComponent);
    // ref.afterClosed().subscribe(result => { if (result) this.cargarUsuarios(); });
    this.snackBar.open('Abriendo formulario de nuevo usuario...', 'Cerrar', {
      duration: 3000,
    });
  }
}