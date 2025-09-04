import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

/**
 * Functional Auth Guard for Angular 17+ standalone components
 * Redirects to '/login' if the user is not authenticated
 */
export const AuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const auth = getAuth();

  const user = await new Promise(resolve => 
    onAuthStateChanged(auth, u => resolve(u), () => resolve(null))
  );

  if (!user) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
