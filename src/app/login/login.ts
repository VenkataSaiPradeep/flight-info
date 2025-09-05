import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private router = inject(Router);
  private auth = inject(Auth);
  private returnUrl = '';

  // Tabs
  activeTab: 'signin' | 'signup' | 'forgot' = 'signin';

  // Form states
  email = '';
  password = '';
  signupEmail = '';
  signupPassword = '';
  confirmPassword = '';
  forgotEmail = '';
  rememberMe = false;
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  // Password visibility toggles
  showSignInPassword = false;
  showSignUpPassword = false;
  showConfirmPassword = false;

  constructor() {
    // Load remembered email on component init
    this.loadRememberedEmail();
    this.returnUrl = inject(ActivatedRoute).snapshot.queryParams['returnUrl'] || '/flight-form';
  }

  // Toggle methods for password visibility
  toggleSignInPassword() {
    this.showSignInPassword = !this.showSignInPassword;
  }

  toggleSignUpPassword() {
    this.showSignUpPassword = !this.showSignUpPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Load remembered email from localStorage
  private loadRememberedEmail() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.email = rememberedEmail;
      this.rememberMe = true;
    }
  }

  // Save or remove remembered email
  private handleRememberMe() {
    if (this.rememberMe && this.email.trim()) {
      localStorage.setItem('rememberedEmail', this.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  }

  // Set authentication persistence based on remember me
  private async setAuthPersistence() {
    try {
      if (this.rememberMe) {
        // Keep user logged in across browser sessions
        await setPersistence(this.auth, browserLocalPersistence);
      } else {
        // Only keep user logged in for current session
        await setPersistence(this.auth, browserSessionPersistence);
      }
    } catch (error) {
      console.warn('Failed to set auth persistence:', error);
    }
  }

  // Sign in with email/password
  async loginWithEmail() {
    if (!this.email.trim() || !this.password) {
      this.showMessage('Please enter both email and password', 'error');
      return;
    }

    this.isLoading = true;
    this.clearMessage();

    try {
      // Set persistence before signing in
      await this.setAuthPersistence();
      
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      
      // Handle remember me functionality
      this.handleRememberMe();
      
      // Successful login
      this.showMessage('Login successful!', 'success');
      // Navigate only after success
       this.router.navigateByUrl(this.returnUrl);
    } catch (error: any) {
      this.showMessage('Login failed: ' + this.getFirebaseErrorMessage(error), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Sign up with email/password
  async signupWithEmail() {
    if (!this.signupEmail.trim() || !this.signupPassword || !this.confirmPassword) {
      this.showMessage('Please fill in all signup fields', 'error');
      return;
    }

    if (this.signupPassword.length < 6) {
      this.showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    if (this.signupPassword !== this.confirmPassword) {
      this.showMessage('Passwords do not match', 'error');
      return;
    }

    this.isLoading = true;
    this.clearMessage();

    try {
      await createUserWithEmailAndPassword(this.auth, this.signupEmail, this.signupPassword);
      this.showMessage('Account created successfully!', 'success');
       this.router.navigateByUrl(this.returnUrl);
    } catch (error: any) {
      this.showMessage('Signup failed: ' + this.getFirebaseErrorMessage(error), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Google login
  async loginWithGoogle() {
    this.isLoading = true;
    this.clearMessage();

    const provider = new GoogleAuthProvider();

    try {
      // Set persistence for Google login too
      await this.setAuthPersistence();
      
      await signInWithPopup(this.auth, provider);
      
      // Handle remember me for Google login
      this.handleRememberMe();
      
      this.showMessage('Google login successful!', 'success');
       this.router.navigateByUrl(this.returnUrl);
    } catch (error: any) {
      this.showMessage('Google login failed: ' + this.getFirebaseErrorMessage(error), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Forgot password functionality
  async sendPasswordReset() {
    if (!this.forgotEmail.trim()) {
      this.showMessage('Please enter your email address', 'error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.forgotEmail)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }

    this.isLoading = true;
    this.clearMessage();

    try {
      await sendPasswordResetEmail(this.auth, this.forgotEmail);
      this.showMessage('Password reset email sent! Check your inbox.', 'success');
      
      // Switch back to sign in tab after a delay
      setTimeout(() => {
        this.activeTab = 'signin';
        this.forgotEmail = '';
      }, 3000);
    } catch (error: any) {
      this.showMessage('Failed to send reset email: ' + this.getFirebaseErrorMessage(error), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Navigate to forgot password
  forgotPassword() {
    this.activeTab = 'forgot';
    this.clearMessage();
    // Pre-fill email if available
    if (this.email.trim()) {
      this.forgotEmail = this.email;
    }
  }

  // Go back to sign in from forgot password
  backToSignIn() {
    this.activeTab = 'signin';
    this.clearMessage();
    this.forgotEmail = '';
  }

  // Helper method to get user-friendly Firebase error messages
  private getFirebaseErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/email-already-in-use':
        return 'Email address is already registered';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed';
      case 'auth/cancelled-popup-request':
        return 'Sign-in popup was cancelled';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage() {
    this.message = '';
  }
}