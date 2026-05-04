import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth'; 
import { map, tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

 
  if (authService.isAuthenticated()) {
    return true;
  }


  return authService.checkAuthStatus().pipe(
    map(isLoggedIn => {
      if (!isLoggedIn) {
        // Si el token no es válido o no existe, al login
        router.navigateByUrl('/auth/login');
        return false;
      }
      return true; // Token válido, repobló el Signal y permite el paso
    })
  );
};