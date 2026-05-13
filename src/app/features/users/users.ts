import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogData } from './models/dialog-config.model';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';

import { UsersService } from './services/users.service';
import { UsuarioDialogComponent } from './components/usuario-dialog/usuario-dialog';
import { Usuario } from './models/users.model';
import { Auth } from '../../auth/services/auth';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    DataTableComponent
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class UsersComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(Auth);

  isVigilante = this.auth.isVigilante();
  isAdmin = this.auth.isAdmin();

  usuarios: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  userColumns = [
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text' },
    { key: 'docType', label: 'Tipo doc.', type: 'text' },
    { key: 'docNumber', label: 'N° documento', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'state', label: 'Estado', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' }
  ];

  cargarUsuarios(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.usersService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data
          .filter((u: Usuario) => !u.roles?.some((r) => r.name.toUpperCase() === 'APRENDIZ'))
          .map((u: Usuario) => ({
            ...u,
            nombreCompleto: `${u.name} ${u.lastName || ''}`,
          }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // NUEVO: Verificar si un usuario es visitante
  esVisitante(usuario: any): boolean {
    return usuario.roles?.some((r: any) => r.name.toUpperCase() === 'VISITANTE') ?? false;
  }

  // NUEVO: Abrir diálogo en modo solo lectura
  verUsuario(usuario: Usuario): void {
    this.dialog.open(UsuarioDialogComponent, {
      data: {
        vigilanteMode: false,
        user: usuario,
        isAdmin: this.isAdmin,
        readonly: true,
        title: 'Ver Información de Usuario'
      } satisfies DialogData,
      width: '95vw',
      maxWidth: '1200px'
    });
  }

  abrirModalNuevo(): void {
    const ref = this.dialog.open(UsuarioDialogComponent, {
      width: '95vw',
      maxWidth: '1200px',
      data: {
        vigilanteMode: false,
        isAdmin: this.isAdmin
      } satisfies DialogData
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;

      this.loading = true;
      this.cdr.detectChanges();

      this.usersService.create(result).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Error al crear usuario',
            'Cerrar',
            { duration: 3000 }
          );
          this.loading = false;
          this.cdr.detectChanges();
          console.error(err);
        }
      });
    });
  }

  registrarVisitante(): void {
    const ref = this.dialog.open(UsuarioDialogComponent, {
      width: '95vw',
      maxWidth: '1200px',
      data: {
        vigilanteMode: true,
        title: 'Registrar Visitante',
        saveButtonText: 'Registrar Visitante',
        isAdmin: this.isAdmin
      } satisfies DialogData
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;

      this.loading = true;
      this.cdr.detectChanges();

      this.usersService.create(result).subscribe({
        next: () => {
          this.snackBar.open('Visitante registrado correctamente', 'Cerrar', {
            duration: 3000
          });
          this.cargarUsuarios();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Error al registrar visitante',
            'Cerrar',
            { duration: 3000 }
          );
          this.loading = false;
          this.cdr.detectChanges();
          console.error(err);
        }
      });
    });
  }

  // MODIFICADO: Si no es visitante, solo ver (no editar)
  editarUsuario(usuario: Usuario): void {
    // ADMIN puede editar a TODOS
    if (this.isAdmin) {
      this.abrirModalEditar(usuario);
      return;
    }

    // VIGILANTE solo puede editar VISITANTES
    if (this.isVigilante && !this.esVisitante(usuario)) {
      this.verUsuario(usuario); // No es visitante, solo ver
      return;
    }

    // VIGILANTE + VISITANTE = editar
    this.abrirModalEditar(usuario);
  }

  // NUEVO: Método separado para abrir el modal de edición
  private abrirModalEditar(usuario: Usuario): void {
    const ref = this.dialog.open(UsuarioDialogComponent, {
      data: {
        vigilanteMode: false,
        user: usuario,
        isAdmin: this.isAdmin
      } satisfies DialogData,
      width: '95vw',
      maxWidth: '1200px'
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;

      this.loading = true;
      this.cdr.detectChanges();

      this.usersService.update(usuario.id, result).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Error al actualizar usuario',
            'Cerrar',
            { duration: 3000 }
          );
          this.loading = false;
          this.cdr.detectChanges();
          console.error(err);
        }
      });
    });
  }

  // MODIFICADO: Solo permitir eliminar visitantes
  eliminarUsuario(usuario: Usuario): void {
    // ADMIN puede eliminar a TODOS
    // VIGILANTE solo puede eliminar VISITANTES
    if (this.isVigilante && !this.esVisitante(usuario)) {
      this.snackBar.open('Solo se pueden eliminar usuarios visitantes', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!usuario.id) {
      this.snackBar.open('Error: usuario sin ID válido', 'Cerrar', { duration: 3000 });
      return;
    }

    if (confirm(`¿Eliminar a ${usuario.name}?`)) {
      this.loading = true;
      this.cdr.detectChanges();

      this.usersService.delete(usuario.id).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Error al eliminar usuario',
            'Cerrar',
            { duration: 3000 }
          );
          this.loading = false;
          this.cdr.detectChanges();
          console.error(err);
        }
      });
    }
  }
}
