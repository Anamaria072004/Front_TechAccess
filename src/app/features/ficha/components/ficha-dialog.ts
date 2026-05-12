import { Component, Inject, OnInit, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-ficha-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './ficha-dialog.html',
  styleUrls: ['./ficha-dialog.scss'],
})
export class FichaDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FichaDialogComponent>);

  isEdit = false;
  fichaForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.isEdit = !!data;
    this.fichaForm = this.fb.group({
      numficha: [data?.numficha || '', [Validators.required, Validators.maxLength(10)]],
      programa: [data?.programa || '', [Validators.required, Validators.maxLength(100)]],
      nivelFormacion: [data?.nivelFormacion || 'Tecnólogo', Validators.required],
      jornada: [data?.jornada || 'Mañana', Validators.required],
      estado: [data?.estado || 'Activo', Validators.required],
      fechaInicio: [data?.fechaInicio ? new Date(data.fechaInicio) : '', Validators.required],
      fechafin: [data?.fechafin ? new Date(data.fechafin) : '', Validators.required],
    });
  }

  ngOnInit() {}

  save() {
    if (this.fichaForm.invalid) return;
    this.dialogRef.close(this.fichaForm.value);
  }
}
