import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { FlightForm } from './flight-form/flight-form';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Root path redirect MUST be first with pathMatch: 'full'
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  
  // Public routes
  {
    path: 'login',
    component: Login
  },
  {
    path: 'signup',
    component: Signup
  },
  
  // Protected routes
  {
    path: 'flight-form',
    component: FlightForm,
    canActivate: [AuthGuard]
  },
  {
    path: 'home',
    component: Home
  },
  
  // Catch-all route MUST be last
  {
    path: '**',
    redirectTo: '/login'
  }
];