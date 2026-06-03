import { Component, OnInit, ChangeDetectorRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogData } from './models/dialog-config.model';
import { DataTableComponent } from '../../shared/components/data-table/data-table';
import { UsersService } from './services/users.service';
import { UsuarioDialogComponent } from './components/usuario-dialog/usuario-dialog';
import { Usuario } from './models/users.model';
import { Auth } from '../../core/services/auth';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Router } from '@angular/router';

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
  private snackBar     = inject(MatSnackBar);
  private dialog       = inject(MatDialog);
  private usersService = inject(UsersService);
  private cdr          = inject(ChangeDetectorRef);
  private auth         = inject(Auth);
  private router       = inject(Router);

  isAdmin      = signal(this.auth.isAdmin());
  isVigilante  = signal(this.auth.isVigilante());
  usuariosRaw  = signal<Usuario[]>([]);
  usuarios     = signal<any[]>([]);
  loading      = signal(true);
  visitanteRoleId = signal<number | null>(null);
  
  showEditButton = computed(() => true); // Ambos roles pueden editar
  showDeleteButton = computed(() => this.isAdmin()); // Solo admin puede eliminar
  
  // Columnas estáticas
  userColumns = [
    { key: 'rolesTexto',     label: 'Rol / Roles',      type: 'text'    },
    { key: 'nombreCompleto', label: 'Nombre completo',  type: 'text'    },
    { key: 'docType',        label: 'Tipo doc.',         type: 'text'    },
    { key: 'docNumber',      label: 'N° documento',      type: 'text'    },
    { key: 'email',          label: 'Email',             type: 'text'    },
    { key: 'ficha',          label: 'Ficha',             type: 'text'    },
    { key: 'state',          label: 'Estado',            type: 'text'    },
    { key: 'actions',        label: 'Acciones',          type: 'actions' }
  ];

  ngOnInit(): void {
    // Cargar roles si es vigilante
    if (this.isVigilante()) {
      this.cargarVisitanteRole();
    }
    
    this.cargarUsuarios();
  }

  private cargarVisitanteRole(): void {
    this.usersService.getRoles().subscribe({
      next: (res) => {
        const roles: any[] = res.data || res;
        const visitante = roles.find((r: any) => r.name.toUpperCase().includes('VISITANTE'));
        if (visitante) {
          this.visitanteRoleId.set(Number(visitante.id));
        }
      }
    });
  }

  cargarUsuarios(): void {
    this.loading.set(true);

    this.usersService.getAll().subscribe({
      next: (res: any) => {
        let allUsers = res.data || res;
        
        // Si es VIGILANTE, filtrar SOLO usuarios con rol VISITANTE
        if (this.isVigilante()) {
          allUsers = allUsers.filter((u: Usuario) =>
            u.roles?.some((r: any) => r.name?.toUpperCase() === 'VISITANTE')
          );
        }

        this.usuariosRaw.set(allUsers);

        this.usuarios.set(allUsers.map((u: Usuario) => ({
          ...u,
          nombreCompleto: `${u.name} ${u.lastName || ''}`.trim(),
          rolesTexto:     u.roles?.map(r => r.name).join(', ') || 'Sin Rol',
          ficha:          u.fichas?.numficha ?? 'Sin ficha'
        })));

        this.loading.set(false);
      },
      error: (err: any) => {
        this.snackBar.open(
          err.error?.message || 'Error al cargar usuarios',
          'Cerrar',
          { duration: 3000 }
        );
        this.loading.set(false);
      }
    });
  }

  verUsuario(usuario: any): void {
    const original = this.usuariosRaw().find(u => u.id === usuario.id);
    if (!original) return;

    this.dialog.open(UsuarioDialogComponent, {
      data: {
        user:     original,
        isAdmin:  this.isAdmin(),
        readonly: true,
        title:    'Ver Información de Usuario'
      } as DialogData,
      width:    '95vw',
      maxWidth: '460px'
    });
  }

  abrirModalNuevo(): void {
    const isVigilante = this.isVigilante();
    const rolId = this.visitanteRoleId();
    
    // Si es vigilante y no tiene el rol ID, esperar
    if (isVigilante && !rolId) {
      this.snackBar.open('Cargando roles, intenta de nuevo...', 'Cerrar', { duration: 3000 });
      return;
    }
    
    const ref = this.dialog.open(UsuarioDialogComponent, {
      width: '100%',
      maxWidth: '460px',
      data: {
        isAdmin: this.isAdmin(),
        vigilanteMode: isVigilante,
        title: isVigilante ? 'Registrar Visitante' : 'Nuevo Usuario'
      } as DialogData
    });

    ref.afterClosed().subscribe((result: any) => {
      if (!result) return;
      this.loading.set(true);

      const payload = isVigilante
        ? this.construirPayloadVigilante(result, rolId)
        : this.construirPayloadAdmin(result);

      this.usersService.create(payload).subscribe({
        next: () => {
          const msg = isVigilante ? 'Visitante registrado exitosamente' : 'Usuario creado';
          this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: (err: any) => {
          this.snackBar.open(err.error?.message || 'Error al crear', 'Cerrar', { duration: 3000 });
          this.loading.set(false);
        }
      });
    });
  }

  private construirPayloadVigilante(result: any, rolId: number | null): any {
    const payload: any = {
      name: result.name,
      lastName: result.lastName,
      docType: result.docType,
      docNumber: result.docNumber,
      email: result.email,
      telephone: result.telephone || null,
      roleIds: rolId ? [Number(rolId)] : [],
      isActive: true,
      state: 'activo'
    };
    if (result.password) payload.password = result.password;
    return payload;
  }

  private construirPayloadAdmin(result: any): any {
    return {
      ...result,
      roleIds: result.roleIds?.length > 0 ? result.roleIds.map(Number) : [],
      isActive: true,
      state: 'activo'
    };
  }

  editarUsuario(usuario: any): void {
    // Si es vigilante, verificar que sea visitante
    if (this.isVigilante()) {
      const esVisitante = usuario.roles?.some((r: any) => r.name?.toUpperCase() === 'VISITANTE');
      if (!esVisitante) {
        this.snackBar.open('Solo puedes editar usuarios con rol Visitante', 'Cerrar', { duration: 3000 });
        return;
      }
    }
    
    const original = this.usuariosRaw().find(u => u.id === usuario.id);
    if (!original) return;

    const ref = this.dialog.open(UsuarioDialogComponent, {
      data: {
        user: original,
        isAdmin: this.isAdmin(),
        vigilanteMode: this.isVigilante()
      } as DialogData,
      width: '95vw',
      maxWidth: '460px'
    });

    ref.afterClosed().subscribe((result: any) => {
      if (!result) return;
      this.loading.set(true);

      const payload = this.isVigilante()
        ? this.construirPayloadVigilanteEdicion(result)
        : this.construirPayloadAdminEdicion(result);

      this.usersService.update(original.id, payload).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: (err: any) => {
          this.snackBar.open(
            err.error?.message || 'Error al actualizar usuario',
            'Cerrar',
            { duration: 3000 }
          );
          this.loading.set(false);
        }
      });
    });
  }

  private construirPayloadVigilanteEdicion(result: any): any {
    const rolId = this.visitanteRoleId();
    return {
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
  }

  private construirPayloadAdminEdicion(result: any): any {
    return result;
  }

  eliminarUsuario(usuario: any): void {
    // Vigilante NO puede eliminar
    if (this.isVigilante()) {
      this.snackBar.open('No tienes permiso para eliminar usuarios', 'Cerrar', { duration: 3000 });
      return;
    }
    
    if (!usuario.id) {
      this.snackBar.open('Error: usuario sin ID válido', 'Cerrar', { duration: 3000 });
      return;
    }

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '95vw',
      maxWidth: '420px',
      data: {
        title:       'Eliminar Usuario',
        message:     `¿Estás seguro de que deseas eliminar a ${usuario.nombreCompleto ?? usuario.name}?`,
        detail:      'Esta acción no se puede deshacer.',
        confirmText: 'Sí, eliminar',
        cancelText:  'Cancelar',
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.loading.set(true);

      this.usersService.delete(usuario.id).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: (err: any) => {
          this.snackBar.open(
            err.error?.message || 'Error al eliminar usuario',
            'Cerrar',
            { duration: 3000 }
          );
          this.loading.set(false);
        }
      });
    });
  }
}