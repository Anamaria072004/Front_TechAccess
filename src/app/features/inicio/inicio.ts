import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule
  ],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class InicioComponent implements OnInit {
  userName = 'Usuario';
  currentDate = new Date();
  
  // Contadores dinámicos que inician en cero
  totalUsuarios = 0;
  totalVehiculos = 0;
  totalFichas = 0;
  totalDispositivos = 0;

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  // Actividad reciente dinámica
  recentActivity: any[] = [];

  ngOnInit() {
    // 1. Obtener nombre del usuario logueado
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userName = user.name || 'Usuario';
      } catch (e) {
        console.error('Error al parsear el usuario', e);
      }
    }

    // 2. Traer el conteo real desde las tablas (endpoints)
    this.http.get<any>('http://localhost:3000/api/users').subscribe({
      next: (res) => { this.totalUsuarios = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin usuarios')
    });

    this.http.get<any>('http://localhost:3000/api/vehiculos').subscribe({
      next: (res) => { this.totalVehiculos = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin vehículos')
    });

    this.http.get<any>('http://localhost:3000/api/ficha').subscribe({
      next: (res) => { this.totalFichas = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin fichas')
    });

    this.http.get<any>('http://localhost:3000/api/dispositivos').subscribe({
      next: (res) => { this.totalDispositivos = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin dispositivos')
    });

    this.http.get<any>('http://localhost:3000/api/reg-acceso').subscribe({
      next: (res) => { 
        const registros = res.data || res;
        
        // Mapear los últimos 4 registros de acceso para la vista de actividad
        if (registros.length > 0) {
          const ultimos = registros.slice(-4).reverse();
          this.recentActivity = ultimos.map((acc: any) => {
            const userStr = acc.usuario ? `${acc.usuario.name} ${acc.usuario.lastName}` : `Usuario ID: ${acc.usuarioId || acc.id}`;
            const timeStr = new Date(acc.horaIngreso).toLocaleTimeString();
            return {
              type: acc.horaSalida ? 'Salida' : 'Ingreso',
              message: `${userStr} ha ${acc.horaSalida ? 'salido' : 'ingresado'} del centro.`,
              time: timeStr,
              icon: acc.horaSalida ? 'logout' : 'login',
              color: acc.horaSalida ? 'orange' : 'blue'
            };
          });
        }
        
        this.cdr.detectChanges(); 
      },
      error: () => console.log('Sin ingresos')
    });
  }
}
