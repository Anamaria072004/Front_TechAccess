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
import { PageNotFound } from './features/page-not-found/page-not-found'; // Importa el componente

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
      { 
        path: 'inicio', 
        component: InicioComponent,
        canActivate: [moduleGuard],
        data: { 
          // Inicio accesible para todos los autenticados
        }
      },
      { 
        path: 'vehiculos', 
        component: VehiculosComponent,
        canActivate: [moduleGuard],
        data: { 
          module: 'vehiculos'
        }
      },
      { 
        path: 'fichas', 
        component: FichasComponent,
        canActivate: [moduleGuard],
        data: { 
          module: 'fichas'
        }
      },
      { 
        path: 'users', 
        component: UsersComponent,
        canActivate: [moduleGuard],
        data: { 
          module: 'users',
          roles: ['admin']
        }
      },
      { 
        path: 'roles', 
        component: RolesComponent,
        canActivate: [moduleGuard],
        data: { 
          module: 'roles',
          roles: ['admin']
        }
      },
      { 
        path: 'dispositivos', 
        component: DispositivosComponent,
        canActivate: [moduleGuard],
        data: { 
          module: 'dispositivos'
        }
      },
      // Redirección interna: si entras al admin sin ruta hija, se va a inicio
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },
  // Ruta para página no encontrada o sin permisos
  { path: 'page-not-found', component: PageNotFound },
  
  // Redirección global: Si la URL está totalmente vacía, mandamos a auth
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  
  // Comodín para rutas no encontradas
  { path: '**', redirectTo: 'page-not-found' } // Cambiado de 'auth' a 'page-not-found'
];