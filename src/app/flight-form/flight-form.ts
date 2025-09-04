import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth';

interface FlightInfoPayload {
  airline: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  numOfGuests: number;
  comments?: string;
}

// Custom Validators
export class CustomValidators {
  // Airline name should contain only letters, spaces, and common airline words
  static airlineName(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const airlinePattern = /^[a-zA-Z\s&\-\.]+$/;
    const value = control.value.trim();
    
    if (!airlinePattern.test(value)) {
      return { invalidAirlineName: { message: 'Airline name should contain only letters, spaces, and common symbols (&, -, .)' } };
    }
    
    if (value.length < 2) {
      return { minLength: { message: 'Airline name must be at least 2 characters long' } };
    }
    
    return null;
  }

  // Flight number should follow airline format (2-3 letters + 1-4 numbers)
  static flightNumber(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const flightPattern = /^[A-Za-z]{2,3}\d{1,4}$/;
    const value = control.value.trim().replace(/\s/g, ''); // Remove spaces
    
    if (!flightPattern.test(value)) {
      return { invalidFlightNumber: { message: 'Flight number should be 2-3 letters followed by 1-4 numbers (e.g., AA123, UAL1234)' } };
    }
    
    return null;
  }

  // Date should be today or in the future and within reasonable range
  static futureDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    const maxDate = new Date();
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    maxDate.setFullYear(maxDate.getFullYear() + 2); // Max 2 years in future
    
    if (selectedDate < today) {
      return { pastDate: { message: 'Arrival date cannot be in the past' } };
    }
    
    if (selectedDate > maxDate) {
      return { farFutureDate: { message: 'Arrival date cannot be more than 2 years in the future' } };
    }
    
    return null;
  }
}

@Component({
  selector: 'app-flight-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-background">
       
      <div class="flight-form-container">
        <div class="form-header">
          <div class="login-background">
        <div class="top-logo">
          <img src="/monsterrg.webp" alt="Monster Reservations Group" class="header-logo">
        </div>
      </div>
          <div class="header-icon">✈️</div>
          <h1 class="form-title">Flight Details</h1>
          <p class="form-subtitle">Please provide your flight details for pickup coordination</p>
        </div>
        
        <div *ngIf="!isSubmittedSuccessfully; else successView" class="flight-form-content">
          <form [formGroup]="flightForm" (ngSubmit)="submit()" class="flight-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Airline *</label>
              <input 
                type="text"
                formControlName="airline" 
                placeholder="Enter airline name (e.g., American Airlines, Delta, United)"
                class="form-input"
                [class.error]="showAirlineError()"
              />
              <div *ngIf="showAirlineError()" class="error-message">
                <span *ngIf="flightForm.controls['airline'].errors?.['required']">Airline name is required</span>
                <span *ngIf="flightForm.controls['airline'].errors?.['invalidAirlineName']">
                  {{ flightForm.controls['airline'].errors?.['invalidAirlineName'].message }}
                </span>
                <span *ngIf="flightForm.controls['airline'].errors?.['minLength']">
                  {{ flightForm.controls['airline'].errors?.['minLength'].message }}
                </span>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half-width">
              <label class="form-label">Arrival Date *</label>
              <input 
                type="date" 
                formControlName="arrivalDate"
                class="form-input"
                [class.error]="showArrivalDateError()"
                [min]="minDate"
                [max]="maxDate"
              />
              <div *ngIf="showArrivalDateError()" class="error-message">
                <span *ngIf="flightForm.controls['arrivalDate'].errors?.['required']">Arrival date is required</span>
                <span *ngIf="flightForm.controls['arrivalDate'].errors?.['pastDate']">
                  {{ flightForm.controls['arrivalDate'].errors?.['pastDate'].message }}
                </span>
                <span *ngIf="flightForm.controls['arrivalDate'].errors?.['farFutureDate']">
                  {{ flightForm.controls['arrivalDate'].errors?.['farFutureDate'].message }}
                </span>
              </div>
            </div>
            <div class="form-group half-width">
              <label class="form-label">Arrival Time *</label>
              <input 
                type="time" 
                formControlName="arrivalTime"
                class="form-input"
                [class.error]="showArrivalTimeError()"
              />
              <div *ngIf="showArrivalTimeError()" class="error-message">
                Arrival time is required
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half-width">
              <label class="form-label">Flight Number *</label>
              <input 
                type="text"
                formControlName="flightNumber" 
                placeholder="e.g., AA1234, UAL567, DL89"
                class="form-input"
                [class.error]="showFlightNumberError()"
                (input)="formatFlightNumber($event)"
              />
              <div *ngIf="showFlightNumberError()" class="error-message">
                <span *ngIf="flightForm.controls['flightNumber'].errors?.['required']">Flight number is required</span>
                <span *ngIf="flightForm.controls['flightNumber'].errors?.['invalidFlightNumber']">
                  {{ flightForm.controls['flightNumber'].errors?.['invalidFlightNumber'].message }}
                </span>
              </div>
            </div>
            <div class="form-group half-width">
              <label class="form-label">Number of Guests *</label>
              <input 
                type="number" 
                formControlName="numOfGuests" 
                min="1"
                max="20"
                placeholder="1"
                class="form-input"
                [class.error]="showGuestsError()"
              />
              <div *ngIf="showGuestsError()" class="error-message">
                <span *ngIf="flightForm.controls['numOfGuests'].errors?.['required']">Number of guests is required</span>
                <span *ngIf="flightForm.controls['numOfGuests'].errors?.['min']">Minimum 1 guest required</span>
                <span *ngIf="flightForm.controls['numOfGuests'].errors?.['max']">Maximum 20 guests allowed</span>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Additional Comments (Optional)</label>
              <textarea 
                formControlName="comments" 
                placeholder="Any special requests, dietary restrictions, accessibility needs, or additional information..."
                class="form-textarea"
                rows="4"
                maxlength="500"
              ></textarea>
              <div class="character-count">
                {{ getCommentsLength() }}/500 characters
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="submit-btn"
              [class.disabled]="!flightForm.valid || isSubmitting"
              [class.loading]="isSubmitting"
              [disabled]="!flightForm.valid || isSubmitting"
            >
              <span class="btn-icon" [class]="isSubmitting ? 'loading-icon' : ''">
                {{ isSubmitting ? '⏳' : '' }}
              </span>
              {{ isSubmitting ? 'Submitting...' : 'Submit' }}
            </button>
          </div>
        </form>

        <div *ngIf="message && !isSubmittedSuccessfully" class="message-container">
          <div 
            class="message"
            [class.success]="messageColor === 'green'"
            [class.error]="messageColor === 'red'"
          >
            {{ message }}
          </div>
        </div>
        </div>

        <!-- Success View Template -->
        <ng-template #successView>
          <div class="success-view">
            <div class="success-icon">✅</div>
            <h2 class="success-title">Flight Details Submitted Successfully!</h2>
            <div class="success-message">
              <p><strong>Thank you!</strong> Your flight information has been recorded and our team will coordinate your pickup accordingly.</p>
            </div>
            
            <div class="submitted-details">
              <h3>Submitted Information:</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Airline:</span>
                  <span class="detail-value">{{ submittedData?.airline }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Flight:</span>
                  <span class="detail-value">{{ submittedData?.flightNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">{{ formatDisplayDate(submittedData?.arrivalDate) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">{{ formatDisplayTime(submittedData?.arrivalTime) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Guests:</span>
                  <span class="detail-value">{{ submittedData?.numOfGuests }}</span>
                </div>
                <div class="detail-item" *ngIf="submittedData?.comments">
                  <span class="detail-label">Comments:</span>
                  <span class="detail-value">{{ submittedData?.comments }}</span>
                </div>
              </div>
            </div>

            <div class="success-actions">
              <button class="secondary-btn" (click)="submitAnother()">
               ✈️ Submit Another Flight Details
              </button>
              <button class="primary-btn" (click)="goToNextStep()">
                ➡️ Continue to Home
              </button>
            </div>

            <div class="contact-info">
              <p><strong>Questions?</strong> Contact us at <a href="mailto:support@monsterrg.com">support@monsterrg.com</a></p>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .page-background {
      min-height: 100vh;
      background: #fff;
      background-attachment: fixed;
      padding: 20px 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

     .top-logo {
      position: absolute;
      top: 30px;
      left: 30px;
      z-index: 10;
      background: rgba(255, 255, 255, 0.95);
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    }
    
    .header-logo {
      max-width: 120px;
      height: auto;
    }

    .flight-form-container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .form-header {
      background: linear-gradient(135deg, #2e8b57 0%, #357abd 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .form-header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
      animation: float 20s infinite linear;
      pointer-events: none;
    }

    @keyframes float {
      0% { transform: translate(0, 0) rotate(0deg); }
      100% { transform: translate(-50px, -50px) rotate(360deg); }
    }

    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
      display: block;
      transform: rotate(-15deg);
      animation: plane 3s ease-in-out infinite;
    }

    @keyframes plane {
      0%, 100% { transform: rotate(-15deg) translateX(0); }
      50% { transform: rotate(-15deg) translateX(10px); }
    }

    .form-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 10px 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      position: relative;
      z-index: 1;
    }

    .form-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
      font-weight: 300;
      position: relative;
      z-index: 1;
    }

    .flight-form {
      padding: 40px 30px;
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 25px;
    }

    .form-row:last-child {
      margin-bottom: 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .form-group.half-width {
      flex: 0.5;
    }

    .form-label {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 8px;
      font-size: 14px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .form-input,
    .form-textarea {
      padding: 16px 20px;
      border: 2px solid #e1e8ed;
      border-radius: 12px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: #fff;
      color: #2c3e50;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
      transform: translateY(-2px);
    }

    .form-input:hover:not(:focus),
    .form-textarea:hover:not(:focus) {
      border-color: #bdc3c7;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .form-input.error,
    .form-textarea.error {
      border-color: #e74c3c;
      background-color: #fdf2f2;
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
      font-family: inherit;
    }

    .character-count {
      font-size: 12px;
      color: #7f8c8d;
      margin-top: 4px;
      text-align: right;
    }

    .error-message {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 6px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .error-message::before {
      content: '⚠️';
      font-size: 10px;
    }

    .form-actions {
      margin-top: 40px;
      text-align: center;
    }

    .submit-btn {
      background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
      color: white;
      border: none;
      padding: 18px 40px;
      font-size: 18px;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
    }

    .submit-btn:hover:not(.disabled) {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(39, 174, 96, 0.4);
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    }

    .submit-btn:active:not(.disabled) {
      transform: translateY(-1px);
    }

    .submit-btn.disabled {
      background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-icon {
      font-size: 16px;
      animation: helicopter 2s ease-in-out infinite;
    }

    .loading-icon {
      animation: spin 1s linear infinite !important;
    }

    @keyframes helicopter {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-5deg); }
      75% { transform: rotate(5deg); }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .message-container {
      padding: 20px 30px 30px;
    }

    .message {
      padding: 16px 20px;
      border-radius: 12px;
      font-weight: 600;
      text-align: center;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .message.success {
      background: linear-gradient(135deg, #d5f4e6 0%, #c8e6c9 100%);
      color: #27ae60;
      border: 2px solid #27ae60;
    }

    .message.error {
      background: linear-gradient(135deg, #fdf2f2 0%, #fadbd8 100%);
      color: #e74c3c;
      border: 2px solid #e74c3c;
    }

    /* Success View Styles */
    .success-view {
      padding: 40px 30px;
      text-align: center;
    }

    .success-icon {
      font-size: 64px;
      margin-bottom: 20px;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }

    .success-title {
      font-size: 28px;
      color: #27ae60;
      margin: 0 0 15px 0;
      font-weight: 700;
    }

    .success-message {
      background: linear-gradient(135deg, #d5f4e6 0%, #c8e6c9 100%);
      border: 2px solid #27ae60;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      color: #1e6b3e;
    }

    .success-message p {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
    }

    .submitted-details {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
      text-align: left;
    }

    .submitted-details h3 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 18px;
      text-align: center;
    }

    .detail-grid {
      display: grid;
      gap: 15px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 12px 0;
      border-bottom: 1px solid #e1e8ed;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 600;
      color: #7f8c8d;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
      flex: 0 0 120px;
    }

    .detail-value {
      color: #2c3e50;
      font-weight: 500;
      flex: 1;
      text-align: right;
      word-break: break-word;
    }

    .success-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin: 30px 0;
      flex-wrap: wrap;
    }

    .primary-btn,
    .secondary-btn {
      padding: 14px 28px;
      border: none;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      letter-spacing: 0.5px;
    }

    .primary-btn {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      color: white;
      box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
    }

    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(52, 152, 219, 0.4);
    }

    .secondary-btn {
      background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
      color: white;
      box-shadow: 0 8px 25px rgba(149, 165, 166, 0.3);
    }

    .secondary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(149, 165, 166, 0.4);
      background: linear-gradient(135deg, #7f8c8d 0%, #6c7b7d 100%);
    }

    .contact-info {
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
      color: #7f8c8d;
      font-size: 14px;
    }

    .contact-info a {
      color: #3498db;
      text-decoration: none;
      font-weight: 600;
    }

    .contact-info a:hover {
      text-decoration: underline;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .page-background {
        padding: 10px;
      }

      .form-row {
        flex-direction: column;
        gap: 15px;
      }

      .form-group.half-width {
        flex: 1;
      }

      .flight-form {
        padding: 30px 20px;
      }

      .form-header {
        padding: 30px 20px;
      }

      .form-title {
        font-size: 28px;
      }

      .submit-btn {
        width: 100%;
        padding: 16px 20px;
      }

      .success-view {
        padding: 30px 20px;
      }

      .success-title {
        font-size: 24px;
      }

      .success-actions {
        flex-direction: column;
        align-items: center;
      }

      .primary-btn,
      .secondary-btn {
        width: 100%;
        justify-content: center;
      }

      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }

      .detail-label {
        flex: none;
      }

      .detail-value {
        text-align: left;
      }
    }

    @media (max-width: 480px) {
      .flight-form-container {
        margin: 0 10px;
      }

      .form-title {
        font-size: 24px;
      }

      .header-icon {
        font-size: 36px;
      }
    }

    /* Custom placeholder styling */
    .form-input::placeholder,
    .form-textarea::placeholder {
      color: #95a5a6;
      opacity: 0.8;
    }

    /* Enhanced focus states */
    .form-input:focus::placeholder,
    .form-textarea:focus::placeholder {
      opacity: 0.5;
      transform: translateY(-2px);
    }

    /* Loading state for button */
    .submit-btn.loading {
      pointer-events: none;
      opacity: 0.8;
    }
  `]
})
export class FlightForm {
  flightForm: FormGroup;
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Date constraints
  minDate: string;
  maxDate: string;

  // Properties for messages and loading state (compatible version without signals)
  message: string = '';
  messageColor: string = 'green';
  isSubmitting: boolean = false;
  isSubmittedSuccessfully: boolean = false;
  submittedData: FlightInfoPayload | null = null;

  constructor() {
    // Set date constraints
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    const maxDateObj = new Date();
    maxDateObj.setFullYear(maxDateObj.getFullYear() + 2);
    this.maxDate = maxDateObj.toISOString().split('T')[0];

    this.flightForm = this.fb.group({
      airline: ['', [Validators.required, CustomValidators.airlineName]],
      arrivalDate: ['', [Validators.required, CustomValidators.futureDate]],
      arrivalTime: ['', Validators.required],
      flightNumber: ['', [Validators.required, CustomValidators.flightNumber]],
      numOfGuests: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      comments: ['', Validators.maxLength(500)]
    });

    // Auto-clear messages on form changes
    this.flightForm.valueChanges.subscribe(() => {
      if (this.flightForm.dirty && this.message) {
        this.message = '';
      }
    });
  }

  // Format flight number as user types
  formatFlightNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '').toUpperCase();
    
    // Limit to reasonable length
    if (value.length > 7) {
      value = value.substring(0, 7);
    }
    
    // Update the form control
    this.flightForm.patchValue({ flightNumber: value }, { emitEvent: false });
    
    // Update the input field directly to ensure UI stays in sync
    event.target.value = value;
  }

  // Validation helpers
  showAirlineError() {
    const control = this.flightForm.controls['airline'];
    return control.invalid && control.touched;
  }

  showArrivalDateError() {
    const control = this.flightForm.controls['arrivalDate'];
    return control.invalid && control.touched;
  }

  showArrivalTimeError() {
    const control = this.flightForm.controls['arrivalTime'];
    return control.invalid && control.touched;
  }

  showFlightNumberError() {
    const control = this.flightForm.controls['flightNumber'];
    return control.invalid && control.touched;
  }

  showGuestsError() {
    const control = this.flightForm.controls['numOfGuests'];
    return control.invalid && control.touched;
  }

  getCommentsLength() {
    return this.flightForm.controls['comments'].value?.length || 0;
  }

  // Format date for display
  formatDisplayDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00'); // Ensure local timezone
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format time for display
  formatDisplayTime(timeString: string | undefined): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Allow user to submit another flight
  submitAnother() {
    this.isSubmittedSuccessfully = false;
    this.submittedData = null;
    this.message = '';
    this.flightForm.reset({ numOfGuests: 1 });
    this.flightForm.markAsUntouched();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Proceed to next step (navigate to home page)
  goToNextStep() {
    // Simple navigation that works without router dependency
    window.location.href = '/';
    
    // Alternative: if you want to use Angular router when it's properly set up
    // this.router.navigate(['/home']);
  }

  submit() {
    if (!this.flightForm.valid) {
      this.flightForm.markAllAsTouched();
      this.message = '❌ Please fill in all required fields correctly.';
      this.messageColor = 'red';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    // Prepare payload according to interface
    const formValue = this.flightForm.value;
    const payload: FlightInfoPayload = {
      airline: formValue.airline.trim(),
      arrivalDate: formValue.arrivalDate, // Date input provides YYYY-MM-DD format
      arrivalTime: formValue.arrivalTime, // Time input provides HH:MM format
      flightNumber: formValue.flightNumber.trim().toUpperCase(),
      numOfGuests: formValue.numOfGuests
    };

    // Only include comments if they exist and aren't empty
    if (formValue.comments && formValue.comments.trim()) {
      payload.comments = formValue.comments.trim();
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'token': 'WW91IG11c3QgYmUgdGhlIGN1cmlvdXMgdHlwZS4gIEJyaW5nIHRoaXMgdXAgYXQgdGhlIGludGVydmlldyBmb3IgYm9udXMgcG9pbnRzICEh',
      'candidate': 'Venkata Sai Pradeep Nagisetti'
    });

    this.http.post('https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge', payload, { headers })
      .subscribe({
        next: (response) => {
          // Store submitted data for display
          this.submittedData = payload;
          this.isSubmittedSuccessfully = true;
          this.message = '✅ Flight details submitted successfully! Your information has been recorded.';
          this.messageColor = 'green';
          this.isSubmitting = false;
          
          // Scroll to top to show success view
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (error) => {
          console.error('Submission error:', error);
          this.message = '❌ Submission failed. Please check your information and try again.';
          this.messageColor = 'red';
          this.isSubmitting = false;
        }
      });
  }
}