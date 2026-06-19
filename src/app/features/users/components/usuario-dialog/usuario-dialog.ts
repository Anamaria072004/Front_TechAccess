import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UsuarioDialogComponent>);
  private usersService = inject(UsersService);
  private fichaService = inject(FichaService);
  data: DialogData = inject(MAT_DIALOG_DATA);

  roles = signal<Role[]>([]);
  fichas = signal<Ficha[]>([]);
  userForm!: FormGroup;

  get esAprendiz(): boolean {
    const selectedId: number | null = this.userForm?.get('roleIds')?.value ?? null;
    return this.roles().some(r => r.id === selectedId && r.name.toUpperCase() === 'APRENDIZ');
  }

  get esVisitante(): boolean {
    const selectedId: number | null = this.userForm?.get('roleIds')?.value ?? null;
    return this.roles().some(r => r.id === selectedId && r.name.toUpperCase() === 'VISITANTE');
  }

  get esInstructor(): boolean {
  const selectedId: number | null = this.userForm?.get('roleIds')?.value ?? null;
  const listadoRoles = this.roles();
  return listadoRoles.some(r => 
    r.id === Number(selectedId) && r.name.trim().toUpperCase() === 'INSTRUCTOR'
  );
}

  ngOnInit(): void {
    const user = this.data?.user;
    const isReadOnly = this.data?.readonly;
    const isVigilante = this.data?.vigilanteMode;

    let presetRoleId: number | null = null;

    if (isVigilante && this.data?.vigilanteRoleId) {
      presetRoleId = this.data.vigilanteRoleId;
    } else if (user) {
      presetRoleId = user.roleIds?.[0] ?? user.roles?.[0]?.id ?? null;
    }

    console.log('Inicializando Diálogo - Modo Vigilante:', isVigilante, 'Rol asignado:', presetRoleId);

    this.userForm = this.fb.group({
      roleIds: [presetRoleId, isVigilante ? [] : [Validators.required]],
      name: [user?.name ?? '', Validators.required],
      lastName: [user?.lastName ?? '', Validators.required],
      docType: [user?.docType ?? 'CC', Validators.required],
      docNumber: [user?.docNumber ?? '', Validators.required],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
      telephone: [user?.telephone ?? ''],
      fichaId: [(user as any)?.fichas?.id ?? null],
      password: [''] // Los validadores se gestionan dinámicamente en 'actualizarValidacionFicha'
    });

    if (isReadOnly) {
      this.userForm.disable();
    }

    // Cambios de rol para ajustar dinámicamente las validaciones
    this.userForm.get('roleIds')?.valueChanges.subscribe(() => {
      this.actualizarValidacionFicha();
    });

    // Cargar datos iniciales de los servicios
    this.usersService.getRoles().subscribe({
      next: (res) => {
        this.roles.set(res.data || res);
        // Ejecutamos la validación inicial una vez que los roles han cargado
        this.actualizarValidacionFicha();
      }
    });

    this.fichaService.getAll().subscribe({
      next: (res) => {
        this.fichas.set(Array.isArray(res) ? res : res.data ?? []);
      }
    });
  }

  private actualizarValidacionFicha(): void {
    if (!this.userForm) return;

    const fichaControl = this.userForm.get('fichaId');
    const passwordControl = this.userForm.get('password');

    // 1. Reglas para el campo Ficha
    if (this.esAprendiz) {
      fichaControl?.setValidators(Validators.required);
    } else {
      fichaControl?.clearValidators();
      fichaControl?.setValue(null);
    }
    fichaControl?.updateValueAndValidity({ emitEvent: false });

    // 2. Reglas para el campo Contraseña (Se centralizan las excepciones)
    const exentoDePassword = this.esAprendiz || this.esVisitante || this.esInstructor || this.data?.vigilanteMode;
    const esNuevoUsuario = !this.data?.user?.id;
    const esLectura = this.data?.readonly;

    if (exentoDePassword) {
      passwordControl?.clearValidators();
      passwordControl?.setValue('');
    } else if (esNuevoUsuario && !esLectura) {
      // Solo se exige contraseña a usuarios nuevos con roles administrativos/estándar
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      // En modo edición de un usuario con contraseña, no es obligatoria a menos que decida cambiarla
      passwordControl?.clearValidators();
    }
    passwordControl?.updateValueAndValidity({ emitEvent: false });
  }
  
  save(): void {
    if (this.data.readonly) return;
    if (!this.userForm.valid) return;

    const formValue = this.userForm.getRawValue();

    if (!this.data.vigilanteMode && !formValue.roleIds) {
      return;
    }

    const payload: any = {
      name: formValue.name,
      lastName: formValue.lastName,
      docType: formValue.docType,
      docNumber: formValue.docNumber,
      email: formValue.email,
      telephone: formValue.telephone || null,
      roleIds: [formValue.roleIds], 
    };

    if (this.esAprendiz && formValue.fichaId) {
      payload.fichasId = formValue.fichaId;
    }

    // El password solo viaja si tiene contenido y el rol no está exento
    if (formValue.password && !this.esAprendiz && !this.esVisitante && !this.esInstructor) {
      payload.password = formValue.password;
    }

    this.dialogRef.close(payload);
  }

  close(): void { 
    this.dialogRef.close(); 
  }
}