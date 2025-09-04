import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hero-image-section">
      <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
           alt="Travel Destination" class="hero-image">
    </div>

    <div class="content-section">
      <div class="container">
        <div class="welcome-card">
          <div class="logo-section">
            <img src="/monsterrg.webp" alt="Monster Reservations Group" class="logo">
          </div>
          <h1 class="hero-title">WELCOME TO MONSTER RESERVATIONS GROUP</h1>
          <p class="hero-subtitle">WE DELIVER ON OUR VACATION PROMISES.</p>
          <div class="action-buttons">
            <button (click)="navigate('login')" class="btn btn-login">Login</button>
            <button (click)="navigate('signup')" class="btn btn-signup">Sign Up</button>
          </div>
        </div>

        <div class="features-section">
          <h2 class="section-title">WHY TRAVEL WITH MONSTER?</h2>
          <div class="features-list">
            <div class="feature-item">
              <h3>✓ We Deliver On Our Vacation Promises</h3>
              <p>You need not worry when booking with Monster. Our guests have spoken and they love their experience! We have an A rating through the Better Business Bureau and 4.9 star Google user rating!</p>
            </div>
            <div class="feature-item">
              <h3>✓ We Offer Variety</h3>
              <p>Monster offers over 50 of the hottest vacation destinations in the U.S., Caribbean, Mexico & abroad!!</p>
            </div>
            <div class="feature-item">
              <h3>✓ Monster is a U.S. Based Company</h3>
              <p>We feature a well trained support team to help answer any and all questions you may have!</p>
            </div>
            <div class="feature-item">
              <h3>✓ Quality Accommodations at affordable pricing</h3>
              <p>Now that's a winning formula! We are proud of the destinations, partners and team members that work tirelessly to help make your vacation experience the best yet.</p>
            </div>
          </div>
        </div>

        <div class="mission-section">
          <h2 class="section-title">OUR MISSION STATEMENT</h2>
          <p class="mission-text">To offer the best product with the best service, period.</p>
        </div>

        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">✈️</div>
            <h3>Flight Management</h3>
            <p>Book and manage your flights with our comprehensive reservation system.</p>
          </div>
          <div class="service-card">
            <div class="service-icon">🏨</div>
            <h3>Hotel Reservations</h3>
            <p>Find and book the perfect accommodation for your travel needs.</p>
          </div>
          <div class="service-card">
            <div class="service-icon">🌟</div>
            <h3>Premium Service</h3>
            <p>Experience our award-winning customer service with 4.9-star rating.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }

    .hero-image-section {
      width: 100%;
      height: 60vh;
      overflow: hidden;
      position: relative;
    }

    .hero-image {
      width: 110%;
      height: 110%;
      object-fit: cover;
      object-position: center;
      animation: slowPan 9s ease-in-out infinite alternate;
      transform-origin: center center;
    }

    @keyframes slowPan {
      0% {
        transform: scale(1.05) translate(0, 0);
      }
      50% {
        transform: scale(1.1) translate(-2%, -1%);
      }
      100% {
        transform: scale(1.05) translate(-1%, 1%);
      }
    }

    .content-section {
      background: #ffffff;
      padding: 0;
      margin-top: -100px;
      position: relative;
      z-index: 2;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .welcome-card {
      background: white;
      margin: 0 20px;
      padding: 60px 40px 40px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      text-align: center;
      margin-bottom: 60px;
    }

    .logo-section {
      margin-bottom: 30px;
    }

    .logo {
      max-width: 150px;
      height: auto;
    }

    .hero-title {
      font-size: clamp(1rem, 4vw, 1.5rem);
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 20px;
      color: #2e8b57;
      letter-spacing: 1px;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      margin-bottom: 30px;
      color: #666;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 30px;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 120px;
    }

    .btn-login {
      background: #2e8b57;
      color: white;
    }

    .btn-login:hover {
      background: #228b22;
      transform: translateY(-1px);
    }

    .btn-signup {
      background: transparent;
      color: #2e8b57;
      border: 2px solid #2e8b57;
    }

    .btn-signup:hover {
      background: #2e8b57;
      color: white;
    }

    .features-section {
      background: white;
      margin: 0 20px;
      padding: 50px 40px;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      margin-bottom: 40px;
    }

    .section-title {
      color: #2e8b57;
      font-size: 2rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 40px;
    }

    .features-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }

    .feature-item {
      padding: 25px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #2e8b57;
    }

    .feature-item h3 {
      color: #2e8b57;
      font-size: 1.2rem;
      margin-bottom: 12px;
      font-weight: 600;
    }

    .feature-item p {
      color: #555;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .mission-section {
      background: white;
      margin: 0 20px;
      padding: 50px 40px;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      text-align: center;
      margin-bottom: 40px;
    }

    .mission-text {
      color: #2e8b57;
      font-size: 1.4rem;
      font-weight: 600;
      font-style: italic;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin: 0 20px 60px;
    }

    .service-card {
      background: white;
      padding: 40px 30px;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.3s ease;
      border-top: 4px solid #2e8b57;
    }

    .service-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }

    .service-icon {
      font-size: 2.5rem;
      margin-bottom: 20px;
    }

    .service-card h3 {
      font-size: 1.3rem;
      color: #2e8b57;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .service-card p {
      color: #666;
      line-height: 1.6;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-image-section {
        height: 50vh;
      }

      .content-section {
        margin-top: -60px;
      }

      .welcome-card,
      .features-section,
      .mission-section {
        margin: 0 10px;
        margin-bottom: 30px;
      }

      .welcome-card {
        padding: 40px 20px 30px;
      }

      .features-section,
      .mission-section {
        padding: 40px 20px;
      }

      .action-buttons {
        flex-direction: column;
        align-items: center;
      }

      .btn {
        width: 100%;
        max-width: 250px;
      }

      .features-list {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .services-grid {
        grid-template-columns: 1fr;
        margin: 0 10px 40px;
      }
    }

    @media (max-width: 480px) {
      .hero-image-section {
        height: 40vh;
      }

      .hero-title {
        font-size: 1.8rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .section-title {
        font-size: 1.6rem;
      }

      .mission-text {
        font-size: 1.2rem;
      }
    }
  `]
})
export class Home {
  constructor(private router: Router) {}

  navigate(path: string) {
    this.router.navigate([`/${path}`]);
  }
}