import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-content">
        <div class="brand-section">
          <mat-icon class="brand-icon">auto_stories</mat-icon>
          <h1 class="brand-name">ReadLoop</h1>
        </div>
        
        <div class="form-section" *ngIf="!emailSent">
          <h2 class="title">Forgot your password?</h2>
          <p class="subtitle">Enter your email address and we'll send you a link to reset your password.</p>
          
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="forgot-password-form">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email address">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="forgotPasswordForm.invalid || isLoading" 
                    class="submit-btn full-width">
              <span *ngIf="!isLoading">Send Reset Link</span>
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
            </button>

            <div class="back-to-login">
              <a routerLink="/login" class="back-link">
                <mat-icon>arrow_back</mat-icon>
                Back to Login
              </a>
            </div>
          </form>
        </div>

        <!-- Success state -->
        <div class="success-section" *ngIf="emailSent">
          <div class="success-icon-container">
            <mat-icon class="success-icon">mark_email_read</mat-icon>
          </div>
          <h2 class="success-title">Check your email</h2>
          <p class="success-subtitle">
            We've sent a password reset link to <strong>{{ submittedEmail }}</strong>
          </p>
          <p class="success-note">
            Didn't receive the email? Check your spam folder or 
            <button type="button" class="resend-btn" (click)="resendEmail()" [disabled]="isLoading">
              <span *ngIf="!isLoading">try again</span>
              <mat-spinner diameter="16" *ngIf="isLoading"></mat-spinner>
            </button>
          </p>
          <div class="success-actions">
            <a mat-button routerLink="/login" class="back-to-login-btn">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      min-height: 100vh;
      background-color: #0f1419;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    
    .forgot-password-content {
      max-width: 400px;
      width: 100%;
      text-align: center;
    }

    .brand-section {
      margin-bottom: 48px;
    }

    .brand-icon {
      color: #00d26a;
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 16px;
    }

    .brand-name {
      color: #ffffff;
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .form-section {
      text-align: left;
    }

    .title {
      color: #ffffff;
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      text-align: center;
    }

    .subtitle {
      color: #9ca3af;
      font-size: 1rem;
      margin: 0 0 32px 0;
      text-align: center;
      line-height: 1.5;
    }
    
    .forgot-password-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .submit-btn {
      background: #00d26a !important;
      color: #000000 !important;
      height: 48px;
      font-weight: 600;
      font-size: 1rem;
      border-radius: 25px;
      text-transform: none;
    }

    .back-to-login {
      text-align: center;
      margin-top: 8px;
    }

    .back-link {
      color: #9ca3af;
      text-decoration: none;
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: #00d26a;
    }

    .back-link mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    /* Success state styles */
    .success-section {
      text-align: center;
    }

    .success-icon-container {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #00d26a, #00a855);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .success-icon {
      color: #000000;
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .success-title {
      color: #ffffff;
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 16px 0;
    }

    .success-subtitle {
      color: #9ca3af;
      font-size: 1rem;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .success-subtitle strong {
      color: #ffffff;
    }

    .success-note {
      color: #9ca3af;
      font-size: 0.875rem;
      margin: 0 0 32px 0;
      line-height: 1.5;
    }

    .resend-btn {
      background: none;
      border: none;
      color: #00d26a;
      cursor: pointer;
      text-decoration: underline;
      font-size: 0.875rem;
      padding: 0;
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .resend-btn:hover {
      color: #00a855;
    }

    .resend-btn:disabled {
      color: #9ca3af;
      cursor: not-allowed;
    }

    .success-actions {
      margin-top: 24px;
    }

    .back-to-login-btn {
      color: #9ca3af !important;
      border: 1px solid #2d3439;
      border-radius: 8px;
      text-transform: none;
      font-weight: 500;
      padding: 12px 24px;
    }

    .back-to-login-btn:hover {
      color: #ffffff !important;
      border-color: #00d26a;
      background-color: rgba(0, 210, 106, 0.1);
    }
    
    @media (max-width: 480px) {
      .forgot-password-container {
        padding: 16px;
      }
      
      .title {
        font-size: 1.5rem;
      }

      .success-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;
  submittedEmail = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const email = this.forgotPasswordForm.value.email;
      
      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.submittedEmail = email;
          this.emailSent = true;
          
          this.snackBar.open(
            response.message || 'Password reset link sent successfully!',
            'Close',
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );
        },
        error: (error) => {
          this.isLoading = false;
          // For user experience, we'll still show success even if there's an error
          // This prevents email enumeration attacks
          this.submittedEmail = email;
          this.emailSent = true;
          
          this.snackBar.open(
            'If an account with that email exists, you will receive a password reset link.',
            'Close',
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );
        }
      });
    }
  }

  resendEmail(): void {
    if (this.submittedEmail) {
      this.onSubmit();
    }
  }
}
