import { inject, Injectable, signal } from '@angular/core';
import { getAuth, User, onAuthStateChanged, signOut } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = getAuth();
  user = signal<User | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, user => this.user.set(user));
  }

  get currentUser() {
    return this.user;
  }

  logout() {
    return signOut(this.auth);
  }

  isLoggedIn() {
    return !!this.user();
  }
}
