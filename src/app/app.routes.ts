import { Routes } from '@angular/router';
import { VehiculosComponent } from './features/vehiculo/vehiculos';
import { Aprendices } from './features/users/aprendices';
import { authGuard } from './core/guards/auth-guard';
import { Fichas } from './features/ficha/ficha';
import { Inicio } from './features/inicio/inicio';
import { Users } from './features/users/users';
import { RolesComponent } from './features/roles/roles';
import { AdminLayoutComponent } from './core/components/admin-layout/admin-layout';

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