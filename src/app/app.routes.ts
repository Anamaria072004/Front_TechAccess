import { Routes } from '@angular/router'; // v1.0.1
import { Dashboard } from './dashboard/dashboard';
import { VehiculosComponent } from './vehiculo/vehiculos';
import { Aprendices } from './users/aprendices';
import { authGuard } from './core/guards/auth-guard';
import { Fichas } from './ficha/ficha';
import { Inicio } from './inicio/inicio';
import { Users } from './users/users';
import { RolesComponent } from './roles/roles';
import { AdminLayoutComponent } from './core/components/admin-layout/admin-layout';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    // path: 'dashboard',
    // component: Dashboard,
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'vehiculos', component: VehiculosComponent },
      { path: 'fichas', component: Fichas },
      { path: 'inicio', component: Inicio },
      { path: 'users', component: Users },
      { path: 'aprendices', component: Aprendices },
      { path: 'roles', component: RolesComponent },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];