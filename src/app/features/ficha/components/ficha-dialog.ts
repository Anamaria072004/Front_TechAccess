import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ficha-dialog',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './ficha-dialog.html',
  styleUrls: ['./ficha-dialog.scss']
})
export class FichaDialogComponent implements OnInit {
  fichaForm: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FichaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Si recibimos data, es una edición
    this.isEdit = !!data;
    
    this.fichaForm = this.fb.group({
      numficha: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      programa: ['', Validators.required],
      nivelFormacion: ['', Validators.required],
      jornada: ['', Validators.required],
      estado: ['Activa', Validators.required],
      fechaInicio: [null, Validators.required],
      fechafin: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.isEdit) {
      // Cargamos los datos en el formulario
      // Asegúrate de convertir las fechas a objetos Date si vienen como string
      this.fichaForm.patchValue({
        ...this.data,
        fechaInicio: this.data.fechaInicio ? new Date(this.data.fechaInicio) : null,
        fechafin: this.data.fechafin ? new Date(this.data.fechafin) : null
      });
    }
  }

  save(): void {
    if (this.fichaForm.valid) {
      const formValue = this.fichaForm.value;
      
      // Aquí puedes formatear las fechas antes de enviarlas si el backend lo requiere
      this.dialogRef.close(formValue);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
