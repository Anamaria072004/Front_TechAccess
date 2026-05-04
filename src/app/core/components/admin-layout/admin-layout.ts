
import { Component, inject, computed } from '@angular/core';
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

interface MenuItem {
  path: string;
  name: string;
  icon: string;
  requiredRoles?: string[];
  requiredModule?: string;
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
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

  // Definir todos los items del menú con sus requisitos
  private allMenuItems: MenuItem[] = [
    { path: '/inicio', name: 'Inicio', icon: 'home' },
    { path: '/vehiculos', name: 'Vehículos', icon: 'directions_car', requiredModule: 'vehiculos' },
    { path: '/fichas', name: 'Fichas', icon: 'description', requiredModule: 'fichas' },
    { path: '/users', name: 'Usuarios', icon: 'people', requiredModule: 'users', requiredRoles: ['admin'] },
    { path: '/roles', name: 'Roles', icon: 'admin_panel_settings', requiredModule: 'roles', requiredRoles: ['admin'] },
    { path: '/dispositivos', name: 'Dispositivos', icon: 'devices', requiredModule: 'dispositivos' }
  ];

  // Menú filtrado según los permisos del usuario (solo lo que puede ver)
  public menuItems = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    const userRoleNames = user.roles.map(r => r.name.toLowerCase());
    const userModuleNames = this.authService.userModules().map(m => m.toLowerCase());

    return this.allMenuItems.filter(item => {
      // Verificar módulo requerido
      if (item.requiredModule && !userModuleNames.includes(item.requiredModule.toLowerCase())) {
        return false;
      }
      
      // Verificar roles requeridos
      if (item.requiredRoles && item.requiredRoles.length > 0) {
        const hasRequiredRole = item.requiredRoles.some(role => 
          userRoleNames.includes(role.toLowerCase())
        );
        if (!hasRequiredRole) return false;
      }
      
      return true;
    });
  });

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay(),
  );

  logout() {
    this.authService.logout();
  }
}