import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { ResetPasswordComponent } from './reset-password/reset-password';

export const AUTH_ROUTES: Routes = [
  { path: 'forgot-password', component: ForgotPasswordComponent }, 
  { path: 'reset-password', component: ResetPasswordComponent },
  { 
    path: 'login', 
    loadComponent: () => import('./log-in/log-in').then(m => m.LogIn) 
  },
  { 
    path: 'sign-in', 
    loadComponent: () => import('./sign-in/sign-in').then(m => m.SignIn) 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
