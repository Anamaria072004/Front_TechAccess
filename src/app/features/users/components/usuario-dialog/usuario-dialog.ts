import { Component, Inject, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UsersService } from '../../services/users.service';
import { DialogData, Role } from '../../models/dialog-config.model';
import { Observable, shareReplay } from 'rxjs';

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './usuario-dialog.html',
  styleUrls: ['./usuario-dialog.scss']
})
export class UsuarioDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UsuarioDialogComponent>);
  private usersService = inject(UsersService);
  data: DialogData = inject(MAT_DIALOG_DATA);

  roles = signal<Role[]>([]);
  visitanteRoleId = signal<number | null>(null);

  isEdit = computed(() => !!this.data?.user?.id);
  isVigilanteMode = computed(() => this.data?.vigilanteMode === true);
  
  // Detectar si el usuario editado es visitante
  isVisitanteUser = computed(() => {
    return this.data?.user?.roles?.some(r => r.name.toUpperCase() === 'VISITANTE') ?? false;
  });

  // Verificar si el usuario actual es admin (viene del componente padre)
  isCurrentUserAdmin = computed(() => {
    return this.data?.isAdmin ?? false;
  });

  // ✅ CORREGIDO: modo simplificado para vigilantes (crear o editar visitante)
  isSimplifiedMode = computed(() => {
    const esCreacionVigilante = this.isVigilanteMode() && !this.isCurrentUserAdmin();
    const esEdicionVisitanteNoAdmin = this.isEdit() && this.isVisitanteUser() && !this.isCurrentUserAdmin();
    return esCreacionVigilante || esEdicionVisitanteNoAdmin;
  });

  dialogTitle = computed(() => {
    if (this.data?.title) return this.data.title;
    return this.isEdit() ? 'Editar Perfil de Usuario' : 'Registrar Nuevo Usuario';
  });

  saveButtonText = computed(() => {
    if (this.data?.saveButtonText) return this.data.saveButtonText;
    return this.isEdit() ? 'Confirmar Cambios' : 'Crear Usuario';
  });

  userForm: FormGroup;

  private rolesCache$?: Observable<Role[]>;

  constructor() {
    const user = this.data?.user;

    this.userForm = this.fb.group({
      name: [user?.name ?? '', Validators.required],
      lastName: [user?.lastName ?? '', Validators.required],
      docType: [user?.docType ?? 'CC', Validators.required],
      docNumber: [user?.docNumber ?? '', Validators.required],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
      password: [''],
      telephone: [user?.telephone ?? ''],
      FamTelephone: [user?.FamTelephone ?? ''],
      state: [user?.state ?? 'activo'],
      isActive: [user?.isActive !== false],
      roleIds: [[]]
    });

    // Modo completo: admin o usuario normal
    const isFullMode = !this.isSimplifiedMode();

    if (isFullMode) {
      this.userForm.get('state')?.setValidators(Validators.required);
      this.userForm.get('roleIds')?.setValidators(Validators.required);
      this.userForm.get('state')?.updateValueAndValidity();
      this.userForm.get('roleIds')?.updateValueAndValidity();
      
      if (!this.isEdit()) {
        this.userForm.get('password')?.setValidators(Validators.required);
        this.userForm.get('password')?.updateValueAndValidity();
      }
    }
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    // Solo cargar roles si NO es modo simplificado
    if (this.isSimplifiedMode()) {
      this.usersService.getRoles().pipe(shareReplay(1)).subscribe({
        next: (res: Role[]) => {
          const visitante = res.find(r => r.name.toUpperCase() === 'VISITANTE');
          this.visitanteRoleId.set(visitante?.id ?? null);
        },
        error: () => console.error('Error loading roles')
      });
      return;
    }

    // Modo completo: cargar todos los roles
    if (!this.rolesCache$) {
      this.rolesCache$ = this.usersService.getRoles().pipe(shareReplay(1));
    }

    this.rolesCache$.subscribe({
      next: (res: Role[]) => {
        this.roles.set(res);
        
        if (this.isEdit() && this.data.user?.roles) {
          this.userForm.patchValue({
            roleIds: this.data.user!.roles!.map((r: Role) => r.id)
          });
        }
      },
      error: () => console.error('Error loading roles')
    });
  }

  save(): void {
    if (this.userForm.invalid) return;

    const formValue = this.userForm.value;

    const payload: any = {
      name: formValue.name,
      lastName: formValue.lastName,
      docType: formValue.docType,
      docNumber: formValue.docNumber,
      email: formValue.email,
      telephone: formValue.telephone || '',
      state: 'activo',
      isActive: true,
      roleIds: []
    };

    // Modo completo: admin o usuario normal
    if (!this.isSimplifiedMode()) {
      payload.FamTelephone = formValue.FamTelephone;
      payload.state = formValue.state;
      payload.isActive = formValue.isActive;
      payload.roleIds = formValue.roleIds || [];
      
      if (formValue.password) {
        payload.password = formValue.password;
      }
    } else {
      // Modo simplificado: visitante
      payload.roleIds = [this.visitanteRoleId()!];
      payload.password = formValue.password || 'Visitante123!';
    }

    this.dialogRef.close(payload);
  }
}