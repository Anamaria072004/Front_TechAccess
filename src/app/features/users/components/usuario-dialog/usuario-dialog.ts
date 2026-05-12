import { Component, Inject, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './usuario-dialog.html',
  styleUrls: ['./usuario-dialog.scss'],
})
export class UsuarioDialogComponent implements OnInit {
  isEdit = false;
  userForm: FormGroup;
  roles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usersService: UsersService,
  ) {
    this.isEdit = !!data;
    this.userForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      lastName: [data?.lastName || '', Validators.required],
      docType: [data?.docType || 'CC', Validators.required],
      docNumber: [data?.docNumber || '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      password: [''], // Only required if !isEdit
      telephone: [data?.telephone || ''],
      FamTelephone: [data?.FamTelephone || ''],
      state: [data?.state || 'activo', Validators.required],
      isActive: [data?.isActive !== false],
      roleIds: [data?.roles?.map((r: any) => r.id) || [], Validators.required],
    });

    if (!this.isEdit) {
      this.userForm.get('password')?.setValidators(Validators.required);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  ngOnInit() {
    this.usersService.getRoles().subscribe({
      next: (res) => (this.roles = res),
      error: () => console.log('Error Loading roles'),
    });
  }

  save() {
    if (this.userForm.invalid) return;
    const payload = this.userForm.value;
    if (this.isEdit && !payload.password) {
      delete payload.password; // Don't send password if empty in edit mode
    }
    this.dialogRef.close(payload);
  }
}
