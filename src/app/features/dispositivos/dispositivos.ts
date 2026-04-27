import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dispositivos',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIconModule,
    RouterModule
  ],
  templateUrl: './dispositivos.html',
  styleUrl: './dispositivos.scss'
})
export class DispositivosComponent {
  private fb = inject(FormBuilder);

  deviceForm = this.fb.group({
    ownerId: ['', Validators.required],
    type: ['Portátil', Validators.required],
    brand: ['', Validators.required],
    serial: ['', Validators.required],
    observations: ['']
  });

  onSubmit() {
    if (this.deviceForm.valid) {
      console.log('Dispositivo registrado:', this.deviceForm.value);
      // Aquí llamarías a tu servicio para guardar en la base de datos
    }
  }
  openRegisterModal() {
  console.log('Abriendo formulario de registro...');
  // Aquí luego pondrás la lógica para abrir un diálogo o navegar
}
}