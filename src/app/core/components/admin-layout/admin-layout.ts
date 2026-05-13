import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../services/auth'; 

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  standalone: true, // Asegúrate de que sea standalone si no usas módulos
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
  ],
})
export class AdminLayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);
  public authService = inject(Auth); 
  
  // Obtenemos los módulos del usuario (suponiendo que es un Signal o Array)
  public menuItems = this.authService.userModules;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay(),
  );

  /**
   * Mapea el nombre del módulo con un icono de Material Design
   */
  getIcon(moduleName: string): string {
    const icons: { [key: string]: string } = {
      'Inicio': 'home',
      'Usuarios': 'person',
      'Roles': 'admin_panel_settings',
      'Dispositivos': 'devices',
      'Configuración': 'settings'
    };
    // Si el nombre viene en inglés o diferente, busca el valor o devuelve uno por defecto
    return icons[moduleName] || 'extension';
  }

  logout() {
    this.authService.logout();
  }
}