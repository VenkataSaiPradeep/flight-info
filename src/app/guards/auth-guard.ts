import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    console.log('🔐 AuthGuard: Checking authentication for:', state.url);
    
    return this.authService.authState$.pipe(
      take(1), // Take only the first emission
      map(user => {
        console.log('🔐 AuthGuard: User state:', user ? `Authenticated: ${user.email}` : 'Not authenticated');
        
        if (user) {
          console.log('✅ AuthGuard: Allowing access');
          return true;
        } else {
          console.log('❌ AuthGuard: Redirecting to login');
          const loginUrl = this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
          });
          console.log('🔄 AuthGuard: Redirect URL:', loginUrl.toString());
          return loginUrl;
        }
      }),
      tap(result => {
        console.log('🔐 AuthGuard: Final result:', result === true ? 'ALLOW' : 'REDIRECT');
      })
    );
  }
}