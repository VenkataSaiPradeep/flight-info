import { Injectable, inject, signal } from '@angular/core';
import { Auth, User, authState, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ 
  providedIn: 'root' 
})
export class AuthService {
  private auth = inject(Auth);
  
  // Signal for reactive UI updates
  user = signal<User | null>(null);
  
  // Observable for guards and reactive programming
  public authState$: Observable<User | null>;

  constructor() {
    console.log('🚀 AuthService: Initializing with Angular Fire...');
    
    // Use Angular Fire's authState observable
    this.authState$ = authState(this.auth);
    
    // Subscribe to auth state changes and update signal
    this.authState$.subscribe(user => {
      console.log('🔔 AuthService: Auth state changed:', user ? `User: ${user.email}` : 'No user');
      this.user.set(user);
    });
  }

  get currentUser() {
    return this.user();
  }

  logout() {
    console.log('🚪 AuthService: Logging out');
    return signOut(this.auth);
  }

  isLoggedIn() {
    return !!this.user();
  }

  // For compatibility with existing code
  waitForAuthState(): Promise<User | null> {
    return new Promise((resolve) => {
      const subscription = this.authState$.subscribe((user) => {
        subscription.unsubscribe();
        resolve(user);
      });
    });
  }
}