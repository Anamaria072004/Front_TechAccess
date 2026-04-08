import { Routes } from '@angular/router';
// Asegúrate de importar el componente aquí
import { Dashboard } from './dashboard/dashboard'; 

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
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