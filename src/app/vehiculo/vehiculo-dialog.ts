import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from '../users/users.service';

@Component({
  selector: 'app-vehiculo-dialog',
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
  templateUrl: './vehiculo-dialog.html',
  styleUrls: ['./vehiculo-dialog.scss']
})
export class VehiculoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<VehiculoDialogComponent>);
  private usersService = inject(UsersService);

  isEdit = false;
  vehiForm: FormGroup;
  usuarios: any[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.isEdit = !!data;
    this.vehiForm = this.fb.group({
      placa: [data?.placa || '', [Validators.required, Validators.maxLength(20)]],
      tipoVehiculo: [data?.tipoVehiculo || 'Automóvil', Validators.required],
      marca: [data?.marca || '', Validators.required],
      color: [data?.color || '', Validators.required],
      modelo: [data?.modelo || '', Validators.required],
      usuarioId: [data?.usuario?.id || '', Validators.required]
    });
  }

  ngOnInit() {
    this.usersService.getAll().subscribe(res => {
      this.usuarios = res;
    });
  }

  save() {
    if (this.vehiForm.invalid) return;
    this.dialogRef.close(this.vehiForm.value);
  }
}
