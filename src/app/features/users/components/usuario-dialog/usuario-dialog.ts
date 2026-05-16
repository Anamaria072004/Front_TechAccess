import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from '../../services/users.service';
import { FichaService } from '@features/ficha/services/ficha.service';
import { DialogData, Role } from '../../models/dialog-config.model';
import { Ficha } from '@features/ficha/models/ficha.model';

function arrayRequired(control: AbstractControl): ValidationErrors | null {
  return Array.isArray(control.value) && control.value.length > 0 ? null : { required: true };
}

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './usuario-dialog.html',
  styleUrls: ['./usuario-dialog.scss']
})
export class UsuarioDialogComponent implements OnInit {
  private fb           = inject(FormBuilder);
  private dialogRef    = inject(MatDialogRef<UsuarioDialogComponent>);
  private usersService = inject(UsersService);
  private fichaService = inject(FichaService);
  data: DialogData     = inject(MAT_DIALOG_DATA);

  roles  = signal<Role[]>([]);
  fichas = signal<Ficha[]>([]);
  userForm!: FormGroup;

  get esAprendiz(): boolean {
    const selectedIds: number[] = this.userForm?.get('roleIds')?.value ?? [];
    return this.roles().some(r =>
      selectedIds.includes(r.id) && r.name.toUpperCase() === 'APRENDIZ'
    );
  }

  ngOnInit(): void {
    const user       = this.data?.user;
    const isReadOnly = this.data?.readonly;
    const isEditing  = !!user?.id;
    const isVigilante    = this.data?.vigilanteMode;
    
    // En modo vigilante el rol viene como roleIds directo en el objeto user
    const presetRoleIds  = (user as any)?.roleIds ?? user?.roles?.map((r: any) => r.id) ?? [];
    
    console.log('Inicializando Diálogo - Modo Vigilante:', isVigilante, 'Roles asignados:', presetRoleIds);

    this.userForm = this.fb.group({
      roleIds:   [presetRoleIds, [arrayRequired]],
      name:      [user?.name      ?? '', Validators.required],
      lastName:  [user?.lastName  ?? '', Validators.required],
      docType:   [user?.docType   ?? 'CC', Validators.required],
      docNumber: [user?.docNumber ?? '', Validators.required],
      email:     [user?.email     ?? '', [Validators.required, Validators.email]],
      telephone: [user?.telephone ?? ''],
      fichaId:   [(user as any)?.fichas?.id ?? null],
      password:  ['', !isEditing && !isReadOnly && !isVigilante
        ? [Validators.required, Validators.minLength(6)]
        : []
      ]
    });

    if (isReadOnly) {
      this.userForm.disable();
    }

    this.userForm.get('roleIds')?.valueChanges.subscribe(() => {
      this.actualizarValidacionFicha();
    });

    this.usersService.getRoles().subscribe({
      next: (res) => this.roles.set(res.data || res)
    });

    this.fichaService.getAll().subscribe({
      next: (res) => {
        this.fichas.set(Array.isArray(res) ? res : res.data ?? []);
      }
    });
  }

  private actualizarValidacionFicha(): void {
    const fichaControl    = this.userForm.get('fichaId');
    const passwordControl = this.userForm.get('password');

    if (this.esAprendiz) {
      fichaControl?.setValidators(Validators.required);
      passwordControl?.clearValidators();
      passwordControl?.setValue('');
    } else {
      fichaControl?.clearValidators();
      fichaControl?.setValue(null);

      // Si es modo vigilante, NO pedimos contraseña nunca
      if (this.data?.vigilanteMode) {
        passwordControl?.clearValidators();
        passwordControl?.setValue('');
      } 
      else if (!this.data.user?.id && !this.data.readonly) {
        passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      }
    }

    fichaControl?.updateValueAndValidity();
    passwordControl?.updateValueAndValidity();
  }

  save(): void {
    if (this.data.readonly) return;
    if (!this.userForm.valid) return;

    const formValue = this.userForm.getRawValue();

    let roleIds = formValue.roleIds.map(Number);
    
    // Si estamos en modo vigilante, FORZAMOS el rol que viene en los datos
    // ignorando cualquier otro valor para mayor seguridad.
    if (this.data?.vigilanteMode) {
      const presetRoleIds = (this.data.user as any)?.roleIds;
      if (presetRoleIds && presetRoleIds.length > 0) {
        roleIds = presetRoleIds.map(Number);
      }
    }

    const payload: any = {
      name:      formValue.name,
      lastName:  formValue.lastName,
      docType:   formValue.docType,
      docNumber: formValue.docNumber,
      email:     formValue.email,
      telephone: formValue.telephone,
      roleIds:   roleIds,
      isActive:  true,
      state:     'activo'
    };

    if (formValue.password) payload.password = formValue.password;

    if (this.esAprendiz && formValue.fichaId) {
      payload.fichasId = Number(formValue.fichaId);
    }

    this.dialogRef.close(payload);
  }

  close() { this.dialogRef.close(); }
}
