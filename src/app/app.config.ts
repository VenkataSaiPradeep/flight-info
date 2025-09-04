import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "flight-info-challenge-a7869", appId: "1:866697461167:web:1d189f8d7756763283835a", storageBucket: "flight-info-challenge-a7869.firebasestorage.app", apiKey: "AIzaSyAkjH2QY3InaUf1EfMrBkFf3m3wM1JCSQw", authDomain: "flight-info-challenge-a7869.firebaseapp.com", messagingSenderId: "866697461167" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())
  ]
};
