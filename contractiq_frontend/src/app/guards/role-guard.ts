import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];
  const userRole = authService.getUserRole();

  if (userRole && requiredRoles.includes(userRole)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};