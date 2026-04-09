import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Importaciones de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Interfaz Ficha
export interface Ficha {
  id: number;
  numficha: string;
  programa: string;
  nivelFormacion: string;
  jornada: string;
  estado: string;
  fechaInicio: Date;
  fechafin: Date;
}

@Component({
  selector: 'app-fichas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './ficha.html',
  styleUrls: ['./ficha.scss']
})
export class Fichas implements OnInit {
  private snackBar = inject(MatSnackBar);
  
  displayedColumns: string[] = ['numficha', 'programa', 'nivelFormacion', 'jornada', 'estado', 'fechaInicio', 'fechafin', 'acciones'];
  dataSource: Ficha[] = [];
  loading = false;
  filterValue = '';

  ngOnInit(): void {
    this.loadFichas();
  }

  loadFichas(): void {
    this.loading = true;
    
    // Datos de ejemplo
    setTimeout(() => {
      this.dataSource = [
        {
          id: 1,
          numficha: '123456',
          programa: 'Análisis y Desarrollo de Software',
          nivelFormacion: 'Tecnólogo',
          jornada: 'Mañana',
          estado: 'Activo',
          fechaInicio: new Date('2024-01-15'),
          fechafin: new Date('2025-01-15')
        },
        {
          id: 2,
          numficha: '123457',
          programa: 'Gestión Empresarial',
          nivelFormacion: 'Técnico',
          jornada: 'Tarde',
          estado: 'Activo',
          fechaInicio: new Date('2024-02-01'),
          fechafin: new Date('2024-12-01')
        },
        {
          id: 3,
          numficha: '123458',
          programa: 'Mantenimiento de Equipos',
          nivelFormacion: 'Tecnólogo',
          jornada: 'Noche',
          estado: 'Inactivo',
          fechaInicio: new Date('2023-08-01'),
          fechafin: new Date('2024-06-30')
        }
      ];
      this.loading = false;
    }, 500);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue.trim().toLowerCase();
    
    if (!this.filterValue) {
      this.loadFichas();
      return;
    }
    
    this.dataSource = this.dataSource.filter(ficha => 
      ficha.numficha.toLowerCase().includes(this.filterValue) ||
      ficha.programa.toLowerCase().includes(this.filterValue) ||
      ficha.jornada.toLowerCase().includes(this.filterValue)
    );
  }

  openCreateDialog(): void {
    this.snackBar.open('Funcionalidad en desarrollo', 'Cerrar', { duration: 2000 });
  }

  openEditDialog(ficha: Ficha): void {
    this.snackBar.open(`Editar ficha ${ficha.numficha}`, 'Cerrar', { duration: 2000 });
  }

  deleteFicha(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta ficha?')) {
      this.snackBar.open('Ficha eliminada exitosamente', 'Cerrar', { duration: 2000 });
      this.loadFichas();
    }
  }

  getEstadoClass(estado: string): string {
    return estado === 'Activo' ? 'estado-activo' : 'estado-inactivo';
  }

  getJornadaClass(jornada: string): string {
    switch(jornada) {
      case 'Mañana': return 'jornada-manana';
      case 'Tarde': return 'jornada-tarde';
      case 'Noche': return 'jornada-noche';
      default: return '';
    }
  }
}