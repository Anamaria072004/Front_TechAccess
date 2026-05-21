import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { DataTableComponent } from '../../../../shared/components/data-table/data-table';
import { UsersService } from '../../services/users.service';
import { UsuarioDialogComponent } from '../usuario-dialog/usuario-dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Usuario } from '../../models/users.model';
import { DialogData } from '../../models/dialog-config.model';

@Component({
  selector: 'app-vigilante',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    DataTableComponent,
  ],
  templateUrl: './vigilante.html',
  styleUrls: ['./vigilante.scss'],
})
export class VigilanteComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private usersService = inject(UsersService);
  public isVigilante: boolean = true;

  visitanteRoleId = signal<number | null>(null);
  usuariosRaw = signal<Usuario[]>([]);
  usuarios = signal<any[]>([]);
  loading = signal(true);


  userColumns = [
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text' },
    { key: 'docType', label: 'Tipo doc.', type: 'text' },
    { key: 'docNumber', label: 'N° documento', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'telephone', label: 'Teléfono', type: 'text' },
    { key: 'state', label: 'Estado', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarVisitanteRole();
  }

  private cargarVisitanteRole(): void {
    this.usersService.getRoles().subscribe({
      next: (res) => {
        const roles: any[] = res.data || res;
        const visitante = roles.find((r: any) => r.name.toUpperCase().includes('VISITANTE'));
        if (visitante) {
          const id = Number(visitante.id);
          this.visitanteRoleId.set(id);
          console.log('ID de Rol VISITANTE detectado:', id);
          this.cargarUsuarios();
        }
      }
    });
  }

  cargarUsuarios(): void {
    this.loading.set(true);
    this.usersService.getAll().subscribe({
      next: (res) => {
        const allUsers: Usuario[] = res.data || res;
        this.usuariosRaw.set(allUsers);

        // Filtrar SOLO usuarios con rol VISITANTE
        const soloVisitantes = allUsers.filter((u: Usuario) =>
          u.roles?.some((r: any) => r.name?.toUpperCase() === 'VISITANTE')
        );

        console.log('Total usuarios:', allUsers.length);
        console.log('Solo visitantes:', soloVisitantes.length);

        // Preparamos los datos para la tabla
        this.usuarios.set(soloVisitantes.map((u: Usuario) => ({
          ...u,
          nombreCompleto: `${u.name} ${u.lastName || ''}`.trim(),
        })));

        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  private esVisitante(usuario: any): boolean {
    return usuario.roles?.some((r: any) => r.name.toUpperCase().includes('VISITANTE'));
  }

  abrirModalNuevoVisitante(): void {
    const rolId = this.visitanteRoleId();
    if (!rolId) {
      this.snackBar.open('Esperando carga de roles...', 'Cerrar', { duration: 3000 });
      return;
    }

    const ref = this.dialog.open(UsuarioDialogComponent, {
      width: '100%',
      maxWidth: '460px',
      data: {
        title: 'Registrar Visitante',
        saveButtonText: 'Registrar',
        isAdmin: false,
        vigilanteMode: true,
      } as DialogData,
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.loading.set(true);

      const payload: any = {
        name: result.name,
        lastName: result.lastName,
        docType: result.docType,
        docNumber: result.docNumber,
        email: result.email,
        telephone: result.telephone || null,
        roleIds: [Number(rolId)],
        isActive: true,
        state: 'activo'
      };

      if (result.password) payload.password = result.password;

      this.usersService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Visitante registrado exitosamente', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al registrar visitante', 'Cerrar', { duration: 3000 });
          this.loading.set(false);
        }
      });
    });
  }

  verUsuario(usuario: any): void {
    const original = this.usuariosRaw().find(u => u.id === usuario.id);
    if (!original) return;

    this.dialog.open(UsuarioDialogComponent, {
      data: {
        user: original as any,
        isAdmin: false,
        readonly: true,
        title: 'Información del Visitante',
      } as DialogData,
      width: '95vw',
      maxWidth: '460px',
    });
  }

  editarVisitante(usuario: any): void {
    if (!this.esVisitante(usuario)) {
      this.snackBar.open('Solo puedes editar usuarios con rol Visitante', 'Cerrar', { duration: 3000 });
      return;
    }

    const original = this.usuariosRaw().find(u => u.id === usuario.id);
    if (!original) return;

    const ref = this.dialog.open(UsuarioDialogComponent, {
      data: {
        user: original as any,
        isAdmin: false,
        vigilanteMode: true,
        title: 'Editar Visitante',
        saveButtonText: 'Actualizar',
      } as DialogData,
      width: '95vw',
      maxWidth: '460px',
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.loading.set(true);

      const rolId = this.visitanteRoleId();

      const payload: any = {
        name: result.name,
        lastName: result.lastName,
        docType: result.docType,
        docNumber: result.docNumber,
        email: result.email,
        telephone: result.telephone || null,
        roleIds: rolId ? [rolId] : [],
        isActive: true,
        state: 'activo'
      };

      if (result.password) payload.password = result.password;

      this.usersService.update(original.id, payload).subscribe({
        next: () => {
          this.snackBar.open('Visitante actualizado exitosamente', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al actualizar', 'Cerrar', { duration: 3000 });
          this.loading.set(false);
        }
      });
    });
  }

  eliminarVisitante(usuario: any): void {
    if (!this.esVisitante(usuario)) {
      this.snackBar.open('Solo puedes eliminar usuarios con rol Visitante', 'Cerrar', { duration: 3000 });
      return;
    }

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '95vw',
      maxWidth: '420px',
      data: {
        title: 'Eliminar Visitante',
        message: `¿Estás seguro de que deseas eliminar a ${usuario.nombreCompleto}?`,
        detail: 'Esta acción no se puede deshacer.',
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.loading.set(true);
      this.usersService.delete(usuario.id).subscribe({
        next: () => {
          this.snackBar.open('Visitante eliminado exitosamente', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al eliminar', 'Cerrar', { duration: 3000 });
          this.loading.set(false);
        }
      });
    });
  }
}