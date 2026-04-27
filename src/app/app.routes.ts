import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { AdminLayoutComponent } from './core/components/admin-layout/admin-layout';

// Importaciones de componentes (Asegúrate de que las rutas de archivo sean exactas)
import { VehiculosComponent } from './features/vehiculo/vehiculos';
import { FichasComponent } from './features/ficha/ficha';
import { InicioComponent } from './features/inicio/inicio';
import { UsersComponent } from './features/users/users';
import { RolesComponent } from './features/roles/roles';
import { DispositivosComponent } from './features/dispositivos/dispositivos';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'inicio', component: InicioComponent },
      { path: 'vehiculos', component: VehiculosComponent },
      { path: 'fichas', component: FichasComponent },
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'dispositivos', component: DispositivosComponent },
      // Redirección interna: si entras a el admin sin ruta hija, se va a inicio
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },
  // Redirección global: Si la URL está totalmente vacía, mandamos a auth
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  // Comodín para rutas no encontradas
  { path: '**', redirectTo: 'auth' }
];