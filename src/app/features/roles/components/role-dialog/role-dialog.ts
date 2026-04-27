import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Importaciones corregidas con Paths y nombres limpios
import { RolesService } from '../../services/roles.service';
import { Role, Modulo } from '@models/user.model';

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
  
  // Usamos el nombre limpio 'Modulo' y tipado estricto
  modules: Modulo[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: Role | null) {
    this.isEdit = !!data;
    
    this.roleForm = this.fb.group({
      name: [data?.name || '', [Validators.required]],
      description: [data?.description || '', [Validators.required]],
      // Mapeo de IDs de módulos asignados
      moduleIds: [data?.modules?.map((m: Modulo) => m.id) || []]
    });
  }

  ngOnInit(): void {
    this.cargarModulos();
  }

  cargarModulos(): void {
    // Asegúrate de que el método en el servicio se llame 'getModules' o 'getModulosDisponibles'
    this.rolesService.getModules().subscribe({
      next: (res: Modulo[]) => {
        this.modules = res;
      },
      error: (err) => {
        console.error('Error loading modules:', err);
      }
    });
  }

  save(): void {
    if (this.roleForm.valid) {
      this.dialogRef.close(this.roleForm.value);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}