import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { FlightForm } from './flight-form/flight-form';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'login',
    component: Login
  },
  { path: 'signup', component: Signup },
  {
    path: 'flight-form',
    component: FlightForm,
    canActivate: [AuthGuard] // Protect this route
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full' // Redirect root to login
  },
  {
    path: '**',
    redirectTo: 'home' // Catch-all redirects to login
  }
];
