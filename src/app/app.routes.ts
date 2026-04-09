import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Vehiculo } from './vehiculo/vehiculo';
import { authGuard } from './core/guards/auth-guard';
import { Ficha, Fichas } from './ficha/ficha';
import { Inicio } from './inicio/inicio';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard], 
    children: [
      { path: 'vehiculos', component: Vehiculo },
      { path: 'fichas', component: Fichas },
      { path: 'inicio', component: Inicio },
    ]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' }
];