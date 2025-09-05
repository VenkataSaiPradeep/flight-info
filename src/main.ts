import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { importProvidersFrom } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';


bootstrapApplication(App, {
  providers: [
    importProvidersFrom(HttpClientModule),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyAkjH2QY3InaUf1EfMrBkFf3m3wM1JCSQw",
      authDomain: "flight-info-challenge-a7869.firebaseapp.com",
      projectId: "flight-info-challenge-a7869",
      storageBucket: "flight-info-challenge-a7869.firebasestorage.app",
      messagingSenderId: "866697461167",
      appId: "1:866697461167:web:1d189f8d7756763283835a"
    })),
    provideAuth(() => getAuth()),
     provideRouter(routes)
  ]
}).catch(err => console.error(err));

