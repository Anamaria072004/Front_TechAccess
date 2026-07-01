import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { ActividadModalComponent } from './components/actividad-modal/actividad-modal';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class InicioComponent implements OnInit {
  userName = 'Usuario';
  currentDate = new Date();
  
  private dialog = inject(MatDialog);
  
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
    this.http.get<any>(`${environment.apiUrl}/api/users`).subscribe({
      next: (res) => { this.totalUsuarios = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin usuarios')
    });

    this.http.get<any>(`${environment.apiUrl}/api/vehiculos`).subscribe({
      next: (res) => { this.totalVehiculos = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin vehículos')
    });

    this.http.get<any>(`${environment.apiUrl}/api/ficha`).subscribe({
      next: (res) => { this.totalFichas = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin fichas')
    });

    this.http.get<any>(`${environment.apiUrl}/api/dispositivos`).subscribe({
      next: (res) => { this.totalDispositivos = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin dispositivos')
    });

    this.http.get<any>(`${environment.apiUrl}/api/reg-acceso`).subscribe({
      next: (res) => { 
        const registros = res.data || res;
        
        // Mapear los últimos 4 registros de acceso para la vista de actividad
        if (registros.length > 0) {
          const ultimos = registros.slice(-4).reverse();
          this.recentActivity = ultimos.map((acc: any) => {
            const userStr = acc.usuario ? `${acc.usuario.name} ${acc.usuario.lastName}` : `Usuario ID: ${acc.usuarioId || acc.id}`;
            
            // Usar la fecha correcta (acc.horaFecha)
            const dateObj = new Date(acc.horaFecha);
            let timeStr = 'Fecha desconocida';
            if (!isNaN(dateObj.getTime())) {
              // Formato legible: "10:30 PM - 12/06/2026"
              const time = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
              const date = dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
              timeStr = `${time} - ${date}`;
            }

            // Usar la acción correcta (accion: true = Ingreso, false = Salida)
            const esIngreso = !!acc.accion;
            return {
              type: esIngreso ? 'Ingreso' : 'Salida',
              message: `${userStr} ha ${esIngreso ? 'ingresado al' : 'salido del'} centro.`,
              time: timeStr,
              icon: esIngreso ? 'login' : 'logout',
              color: esIngreso ? 'blue' : 'orange'
            };
          });
        }
        
        this.cdr.detectChanges(); 
      },
      error: () => console.log('Sin ingresos')
    });
  }

  abrirModalActividad(): void {
    this.dialog.open(ActividadModalComponent, {
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false
    });
  }
}
