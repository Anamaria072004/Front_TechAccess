import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RolesService, ModuleEntity } from './roles.service';

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './role-dialog.html',
  styleUrls: ['./role-dialog.scss']
})
export class RoleDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rolesService = inject(RolesService);
  private dialogRef = inject(MatDialogRef<RoleDialogComponent>);

  isEdit = false;
  roleForm: FormGroup;
  modules: ModuleEntity[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.isEdit = !!data;
    this.roleForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || '', Validators.required],
      moduleIds: [data?.modules?.map((m: any) => m.id) || []] // Permisos ahora opcionales
    });
  }

  ngOnInit() {
    this.rolesService.getModules().subscribe({
      next: (res) => this.modules = res,
      error: () => console.log('Error Loading modules') 
    });
  }

  save() {
    if (this.roleForm.invalid) return;
    this.dialogRef.close(this.roleForm.value);
  }
}
