// src/app/core/guards/module.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

export const moduleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const requiredModule = route.data['module'] as string | undefined;
  const requiredRoles = route.data['roles'] as string[] | undefined;

  const showAccessDenied = (message: string) => {
    snackBar.open(message, 'Cerrar', { 
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  };

  const validateAccess = (): boolean => {
    const user = authService.currentUser();

    if (!user) {
      console.warn('No hay datos de usuario');
      router.navigateByUrl('/auth/login');
      return false;
    }

    const userRoleNames = user.roles.map(r => r.name.toLowerCase());
    const userModuleNames = authService.userModules().map(m => m.toLowerCase());

    console.log('Verificando acceso a:', state.url);
    console.log('Módulos del usuario:', userModuleNames);
    console.log('Roles del usuario:', userRoleNames);
    console.log('Módulo requerido:', requiredModule);
    console.log('Roles requeridos:', requiredRoles);

    // Si no hay requisitos, acceso permitido
    if (!requiredModule && (!requiredRoles || requiredRoles.length === 0)) {
      console.log('Sin restricciones, acceso permitido');
      return true;
    }

    // Validar roles requeridos
    if (requiredRoles && requiredRoles.length > 0) {
      const requiredRolesLower = requiredRoles.map(r => r.toLowerCase());
      const hasRole = requiredRolesLower.some(role => userRoleNames.includes(role));

      if (!hasRole) {
        console.warn(`Acceso denegado por rol. Se requiere: ${requiredRoles.join(', ')}`);
        showAccessDenied(`Acceso denegado. Se requiere rol: ${requiredRoles.join(', ')}`);
        // Redirigir a page-not-found en lugar de inicio
        router.navigate(['/page-not-found']);
        return false;
      }
      console.log('Validación de rol exitosa');
    }

    // Validar módulo requerido
    if (requiredModule) {
      const hasModule = userModuleNames.includes(requiredModule.toLowerCase());

      if (!hasModule) {
        console.warn(`Acceso denegado por módulo. Se requiere: ${requiredModule}`);
        showAccessDenied(`No tienes acceso al módulo: ${requiredModule}`);
        // Redirigir a page-not-found en lugar de inicio
        router.navigate(['/page-not-found']);
        return false;
      }
      console.log('Validación de módulo exitosa');
    }

    console.log('Acceso permitido');
    return true;
  };

  // Si ya está autenticado, validamos directamente
  if (authService.isAuthenticated()) {
    return validateAccess();
  }

  console.log('Sin sesión activa, verificando estado...');
  
  authService.checkAuthStatus().subscribe({
    next: (isLoggedIn) => {
      if (isLoggedIn) {
        const isValid = validateAccess();
        if (!isValid) {
          router.navigate(['/page-not-found']);
        }
      } else {
        router.navigateByUrl('/auth/login');
      }
    },
    error: () => {
      router.navigateByUrl('/auth/login');
    }
  });
  
  return false;
};