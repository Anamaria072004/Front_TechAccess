import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones de Angular Material Necesarias
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table'; // <--- Crucial para mat-table
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-vehiculo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule, // Asegúrate de que esté aquí
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './vehiculo.html',
  styleUrl: './vehiculo.scss'
})
export class Vehiculo implements OnInit {
  // Las columnas deben coincidir EXACTAMENTE con los matColumnDef del HTML
  displayedColumns: string[] = ['id', 'placa', 'tipoVehiculo', 'marca', 'color', 'usuario', 'acciones'];
  
  dataSource: any[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.loadVehiculos();
  }

  loadVehiculos(): void {
    this.loading = true;
    // Simulación de datos
    setTimeout(() => {
      this.dataSource = [
        { 
          id: 1, 
          placa: 'KLR-456', 
          tipoVehiculo: 'Motocicleta', 
          marca: 'Yamaha', 
          color: 'Negro', 
          colorHex: '#000000', 
          usuario: { nombre: 'Andrés Pérez' } 
        },
        { 
          id: 2, 
          placa: 'MXZ-789', 
          tipoVehiculo: 'Camioneta', 
          marca: 'Toyota', 
          color: 'Blanco', 
          colorHex: '#ffffff', 
          usuario: { nombre: 'Maria Vera' } 
        }
      ];
      this.loading = false;
    }, 1500);
  }

  // --- MÉTODOS QUE TU HTML LLAMA ---

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log('Buscando:', filterValue);
    // Aquí filtrarías tu dataSource
  }

  filterByType(tipo: string): void {
    console.log('Filtrando por tipo:', tipo);
  }

  getTipoClass(tipo: string): string {
    switch (tipo) {
      case 'Motocicleta': return 'jornada-manana'; // Clases de tu SCSS
      case 'Camioneta': return 'jornada-tarde';
      case 'Camión': return 'jornada-noche';
      default: return '';
    }
  }

  openCreateDialog(): void {
    console.log('Crear nuevo vehículo');
  }

  openEditDialog(vehiculo: any): void {
    console.log('Editando:', vehiculo);
  }

  deleteVehiculo(id: number): void {
    console.log('Borrando ID:', id);
  }
}