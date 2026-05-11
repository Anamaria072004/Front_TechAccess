import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { moduleGuard } from './core/guards/module.guard';
import { AdminLayoutComponent } from './core/components/admin-layout/admin-layout';

// Importaciones de componentes
import { VehiculosComponent } from './features/vehiculo/vehiculos';
import { FichasComponent } from './features/ficha/ficha';
import { InicioComponent } from './features/inicio/inicio';
import { UsersComponent } from './features/users/users';
import { RolesComponent } from './features/roles/roles';
import { DispositivosComponent } from './features/dispositivos/dispositivos';
import { PageNotFound } from './features/page-not-found/page-not-found';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './auth/reset-password/reset-password';


export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard], // Verifica que el usuario esté logueado
    children: [
      {
        path: 'inicio',
        component: InicioComponent
        // No necesita moduleGuard si es el home general del admin
      },
      {
        path: 'vehiculos',
        component: VehiculosComponent,
        canActivate: [moduleGuard],
        data: { module: 'vehiculos' }
      },
      {
        path: 'fichas',
        component: FichasComponent,
        canActivate: [moduleGuard],
        data: { module: 'fichas' }
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [moduleGuard],
        data: {
          module: 'users',
        }
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [moduleGuard],
        data: {
          module: 'roles',
        }
      },
      {
        path: 'dispositivos',
        component: DispositivosComponent,
        canActivate: [moduleGuard],
        data: { module: 'dispositivos' }
      },
      // Redirección interna: de / a /inicio
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },
  { path: 'reset-password', component: ResetPasswordComponent },
  //recupercacion de contraseña
  { path: 'forgot-password', component: ForgotPasswordComponent },
  // Página de error/sin permisos
  { path: 'page-not-found', component: PageNotFound },

  // Redirección global inicial
  { path: '', redirectTo: 'auth', pathMatch: 'full' },

  // Comodín para cualquier ruta no definida
  { path: '**', redirectTo: 'page-not-found' },
];
