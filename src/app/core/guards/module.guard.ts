import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, of } from 'rxjs';

export const moduleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Solo nos interesa el nombre del módulo definido en app.routes.ts
  const requiredModule = route.data['module'] as string | undefined;

  const showAccessDenied = (message: string) => {
    snackBar.open(message, 'Cerrar', { 
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  };

  const validateAccess = (): boolean => {
    const user = authService.currentUser();
    
    if (!user) {
      router.navigateByUrl('/auth/login');
      return false;
    }

    // Obtenemos los módulos que el ADMIN le asignó en la BD
    const userModuleNames = authService.userModules().map(m => m.toLowerCase());

    // LOG DE DEPURACIÓN: Aquí verás si el vigilante trae el módulo de la BD
    console.log(`Ruta: ${state.url} | Requiere: ${requiredModule} | Usuario tiene:`, userModuleNames);

    // Si la ruta no pide un módulo específico, lo dejamos pasar (ej: inicio)
    if (!requiredModule) return true;

    // VALIDACIÓN DINÁMICA: ¿El módulo requerido está en la lista de la BD de este usuario?
    const hasModule = userModuleNames.includes(requiredModule.toLowerCase());

    if (!hasModule) {
      showAccessDenied(`No tienes permiso asignado para el módulo: ${requiredModule}`);
      router.navigate(['/page-not-found']);
      return false;
    }

    return true;
  };

  // MANEJO DE ASINCRONÍA (Importante para evitar el 404 al refrescar)
  if (authService.isAuthenticated()) {
    return validateAccess();
  }

  // Si no está autenticado (refresco de página), esperamos a que el servicio responda
  return authService.checkAuthStatus().pipe(
    map(isLoggedIn => {
      if (isLoggedIn) {
        return validateAccess();
      } else {
        router.navigateByUrl('/auth/login');
        return false;
      }
    })
  );
};
