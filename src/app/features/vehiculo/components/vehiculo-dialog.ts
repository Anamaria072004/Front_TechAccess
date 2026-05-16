import { Component, Inject, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from '@features/users/services/users.service';

@Component({
  selector: 'app-vehiculo-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './vehiculo-dialog.html',
  styleUrls: ['./vehiculo-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddVehiculoModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddVehiculoModalComponent>);
  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);

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
      usuarioId: [data?.usuario?.id || '', Validators.required],
    });
  }

  ngOnInit() {
    this.usersService.getAll().subscribe((res) => {
      this.usuarios = res.data || res;
      this.cdr.markForCheck();
    });
  }

  save() {
    if (this.vehiForm.invalid) return;
    this.dialogRef.close(this.vehiForm.value);
  }

  close() {
    this.dialogRef.close();
  }
}
