import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  public authService = inject(Auth);

  // Signal del usuario actual
  public currentUser = this.authService.currentUser;

  // Módulos del menú
  public menuItems = this.authService.userModules;

  // Breakpoint signal (Solución definitiva al NG0100 y parpadeos en layout)
  public isHandset = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map((result) => result.matches),
      shareReplay()
    ),
    { initialValue: this.breakpointObserver.isMatched(Breakpoints.Handset) }
  );
  
  // El título se maneja directamente en el template para máxima estabilidad funcional

  /**
   * Mapea el nombre del módulo con un ícono de Material Design.
   * Basado en los módulos reales registrados en el backend.
   */
  getIcon(moduleName: string): string {
    const name = moduleName.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'inicio':        'home',
      'home':          'home',
      'usuarios':      'manage_accounts',
      'users':         'manage_accounts',
      'roles':         'admin_panel_settings',
      'dispositivos':  'devices',
      'devices':       'devices',
      'vehículos':     'directions_car',
      'vehiculos':     'directions_car',
      'vehicles':      'directions_car',
      'fichas':        'badge',
      'módulos':       'view_module',
      'modules':       'view_module',
      'configuración': 'settings',
      'settings':      'settings',
      'vigilante':     'security',
      'accesos':       'fingerprint',
    };
    return iconMap[name] ?? 'extension';
  }

  logout(): void {
    this.authService.logout();
  }
}
