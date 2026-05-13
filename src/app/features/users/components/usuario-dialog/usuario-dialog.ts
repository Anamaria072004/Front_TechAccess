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
import { DialogData, Role } from '../../models/dialog-config.model';

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
  data: DialogData = inject(MAT_DIALOG_DATA);

  roles = signal<Role[]>([]);
  userForm: FormGroup;

  constructor() {
    const user = this.data?.user;
    const isVig = this.data?.vigilanteMode;
    const isReadOnly = this.data?.readonly;

    this.userForm = this.fb.group({
      name: [user?.name ?? '', Validators.required],
      lastName: [user?.lastName ?? '', Validators.required],
      docType: [user?.docType ?? 'CC', Validators.required],
      docNumber: [user?.docNumber ?? '', Validators.required],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
      telephone: [user?.telephone ?? ''],
      password: [''],
      roleIds: [user?.roles?.map((r: any) => r.id) ?? [], isVig ? [] : [Validators.required]]
    });

    // BLOQUEO TOTAL SI ES SOLO LECTURA (MODO OJO)
    if (isReadOnly) {
      this.userForm.disable();
    }

    if (!isVig && !user?.id && !isReadOnly) {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  ngOnInit(): void {
    this.usersService.getRoles().subscribe({
      next: (res) => {
        this.roles.set(res);
        // Si es modo vigilante y no es solo lectura, asignamos el rol automáticamente
        if (this.data.vigilanteMode && !this.data.user?.id && !this.data.readonly) {
          const vRole = res.find(r => r.name.toUpperCase().includes('VIGILANTE'));
          if (vRole) {
            this.userForm.get('roleIds')?.setValue([vRole.id]);
          }
        }
      }
    });
  }

  save(): void {
    // Si es solo lectura, esta función no debería ejecutarse, pero añadimos protección
    if (this.data.readonly) return;

    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      let rolesFinales = formValue.roleIds;

      if (this.data.vigilanteMode && (!rolesFinales || rolesFinales.length === 0)) {
        const vRole = this.roles().find(r => r.name.toUpperCase().includes('VIGILANTE'));
        if (vRole) rolesFinales = [vRole.id];
      }

      const payload = {
        ...formValue,
        roleIds: rolesFinales.map(Number),
        isActive: true,
        state: 'activo'
      };

      if (this.data.vigilanteMode && !this.data.user?.id) {
        payload.password = 'Visitante123!';
      }

      if (!payload.password) delete payload.password;
      this.dialogRef.close(payload);
    }
  }

  close() { this.dialogRef.close(); }
}