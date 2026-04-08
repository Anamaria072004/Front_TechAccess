import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Importaciones de Material necesarias
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.html', // Verifica que el archivo se llame así y no dashboard.component.html
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private router = inject(Router);
  userName: string = 'Usuario';

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userName = user.name || 'Usuario';
      } catch (e) {
        console.error('Error al parsear el usuario', e);
      }
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }
}