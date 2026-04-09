import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Vehiculo } from './vehiculo/vehiculo';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
    }, // Ajusta la ruta de importación

    { path: 'vehiculo', component: Vehiculo },
    {
        path: 'dashboard',
        component: Dashboard
    },

    {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'auth'
    }
];