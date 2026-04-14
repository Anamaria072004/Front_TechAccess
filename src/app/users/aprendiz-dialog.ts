import { Component, Inject, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UsersService } from './users.service';
import { RolesService } from '../roles/roles.service';
import { FichaService, Ficha } from '../ficha/ficha.service';

@Component({
  selector: 'app-aprendiz-dialog',
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
  templateUrl: './aprendiz-dialog.html',
  styleUrls: ['./aprendiz-dialog.scss']
})
export class AprendizDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AprendizDialogComponent>);
  private usersService = inject(UsersService);
  private fichaService = inject(FichaService);
  private rolesService = inject(RolesService);
  private cdr = inject(ChangeDetectorRef);

  isEdit = false;
  userForm: FormGroup;
  fichas: Ficha[] = [];
  aprendizRoleId: number | null = null;
  loadingRoles = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.isEdit = !!data;
    this.userForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      lastName: [data?.lastName || '', Validators.required],
      docType: [data?.docType || 'CC', Validators.required],
      docNumber: [data?.docNumber || '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      password: [''],
      telephone: [data?.telephone || ''],
      FamTelephone: [data?.FamTelephone || ''],
      state: [data?.state || 'activo', Validators.required],
      isActive: [data?.isActive !== false],
      fichasId: [data?.fichas?.id || '', Validators.required],
      roleIds: [[]],
      
      // Vehículo
      hasVehicle: [false],
      placa: [''],
      marca: [''],
      modelo: [''],
      color: [''],
      tipoVehiculo: ['Automóvil']
    });

    // Validación condicional para el vehículo
    this.userForm.get('hasVehicle')?.valueChanges.subscribe(checked => {
      const vehicleFields = ['placa', 'marca', 'modelo', 'color', 'tipoVehiculo'];
      vehicleFields.forEach(field => {
        const control = this.userForm.get(field);
        if (checked) {
          control?.setValidators(Validators.required);
        } else {
          control?.clearValidators();
          control?.setValue('');
        }
        control?.updateValueAndValidity();
      });
    });
  }

  ngOnInit() {
    // Cargar Fichas
    this.fichaService.getAll(1, 1000).subscribe(res => {
      this.fichas = res.data || res;
      this.cdr.detectChanges();
    });

    // Cargar Roles para encontrar el de Aprendiz
    this.usersService.getRoles().subscribe({
      next: (roles) => {
        const role = roles.find((r: any) => r.name.trim().toUpperCase() === 'APRENDIZ');
        if (role) {
          this.aprendizRoleId = role.id;
          this.userForm.patchValue({ roleIds: [role.id] });
        } else {
          console.error('No se encontró el rol APRENDIZ en el sistema');
        }
        this.loadingRoles = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingRoles = false;
        this.cdr.detectChanges();
        console.error('Error al cargar roles');
      }
    });
  }

  save() {
    if (this.userForm.invalid || !this.aprendizRoleId) return;
    
    const val = { ...this.userForm.value };
    
    // Asegurar que el documento sea texto
    if (val.docNumber) val.docNumber = val.docNumber.toString();
    
    // Si tiene vehículo, los procesamos, si no, los eliminamos
    if (val.hasVehicle) {
      // Nos aseguramos que la placa sea texto y mayúsculas
      if (val.placa) val.placa = val.placa.toString().toUpperCase();
    } else {
      ['placa', 'marca', 'modelo', 'color', 'tipoVehiculo'].forEach(f => delete val[f]);
    }

    // ELIMINAR SIEMPRE hasVehicle: El backend no debe recibir esta propiedad de control UI
    delete val.hasVehicle;
    
    // Aseguramos que siempre lleve el rol de aprendiz
    val.roleIds = [this.aprendizRoleId];
    
    this.dialogRef.close(val);
  }
}
