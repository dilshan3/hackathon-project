import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
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
    <div class="reset-password-container">
      <div class="reset-password-content">
        <div class="brand-section">
          <mat-icon class="brand-icon">auto_stories</mat-icon>
          <h1 class="brand-name">ReadLoop</h1>
        </div>
        
        <div class="form-section" *ngIf="!passwordReset && isValidToken">
          <h2 class="title">Reset your password</h2>
          <p class="subtitle">Enter your new password below.</p>
          
          <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="reset-password-form">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter new password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="resetPasswordForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="resetPasswordForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters long
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword" placeholder="Confirm new password">
              <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="resetPasswordForm.get('confirmPassword')?.hasError('required')">
                Please confirm your password
              </mat-error>
              <mat-error *ngIf="resetPasswordForm.get('confirmPassword')?.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="resetPasswordForm.invalid || isLoading" 
                    class="submit-btn full-width">
              <span *ngIf="!isLoading">Reset Password</span>
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
        <div class="success-section" *ngIf="passwordReset">
          <div class="success-icon-container">
            <mat-icon class="success-icon">check_circle</mat-icon>
          </div>
          <h2 class="success-title">Password reset successful!</h2>
          <p class="success-subtitle">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <div class="success-actions">
            <a mat-raised-button routerLink="/login" class="login-btn">
              Continue to Login
            </a>
          </div>
        </div>

        <!-- Invalid token state -->
        <div class="error-section" *ngIf="!isValidToken">
          <div class="error-icon-container">
            <mat-icon class="error-icon">error</mat-icon>
          </div>
          <h2 class="error-title">Invalid or expired link</h2>
          <p class="error-subtitle">
            This password reset link is invalid or has expired. Please request a new password reset link.
          </p>
          <div class="error-actions">
            <a mat-raised-button routerLink="/forgot-password" class="forgot-password-btn">
              Request New Link
            </a>
            <a mat-button routerLink="/login" class="back-to-login-btn">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reset-password-container {
      min-height: 100vh;
      background-color: #0f1419;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    
    .reset-password-content {
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
    
    .reset-password-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
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
      margin-top: 8px;
    }

    .back-to-login {
      text-align: center;
      margin-top: 16px;
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
      margin: 0 0 32px 0;
      line-height: 1.5;
    }

    .success-actions {
      margin-top: 24px;
    }

    .login-btn {
      background: #00d26a !important;
      color: #000000 !important;
      border-radius: 25px;
      text-transform: none;
      font-weight: 600;
      padding: 12px 32px;
    }

    /* Error state styles */
    .error-section {
      text-align: center;
    }

    .error-icon-container {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-icon {
      color: #ffffff;
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .error-title {
      color: #ffffff;
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 16px 0;
    }

    .error-subtitle {
      color: #9ca3af;
      font-size: 1rem;
      margin: 0 0 32px 0;
      line-height: 1.5;
    }

    .error-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
    }

    .forgot-password-btn {
      background: #00d26a !important;
      color: #000000 !important;
      border-radius: 25px;
      text-transform: none;
      font-weight: 600;
      padding: 12px 32px;
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
      .reset-password-container {
        padding: 16px;
      }
      
      .title, .success-title, .error-title {
        font-size: 1.5rem;
      }

      .error-actions {
        gap: 12px;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  passwordReset = false;
  isValidToken = true;
  hidePassword = true;
  hideConfirmPassword = true;
  private resetToken = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get the reset token from the URL
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
      if (!this.resetToken) {
        this.isValidToken = false;
      } else {
        // In a real app, you would validate the token with the backend
        this.validateToken(this.resetToken);
      }
    });
  }

  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  private validateToken(token: string): void {
    this.authService.validateResetToken(token).subscribe({
      next: (response) => {
        this.isValidToken = response.valid;
      },
      error: () => {
        this.isValidToken = false;
      }
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.isValidToken) {
      this.isLoading = true;
      const password = this.resetPasswordForm.value.password;
      
      this.authService.resetPassword(this.resetToken, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.passwordReset = true;
          
          this.snackBar.open(
            response.message || 'Password reset successfully!',
            'Close',
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );
        },
        error: (error) => {
          this.isLoading = false;
          
          this.snackBar.open(
            error.message || 'Failed to reset password. Please try again.',
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    }
  }
}
