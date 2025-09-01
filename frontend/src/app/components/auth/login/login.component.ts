import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/auth-request.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <div class="login-content">
        <div class="brand-section">
          <mat-icon class="brand-icon">auto_stories</mat-icon>
          <h1 class="brand-name">ReadLoop</h1>
        </div>
        
        <div class="login-form-section">
          <h2 class="welcome-title">Welcome back</h2>
          <p class="welcome-subtitle">Sign in to continue your book sharing journey.</p>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Email address">
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <div class="forgot-password">
              <a routerLink="/forgot-password" class="forgot-link">Forgot your password?</a>
            </div>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="loginForm.invalid || isLoading" 
                    class="login-btn full-width">
              <span *ngIf="!isLoading">Login</span>
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
            </button>

            <div class="divider">
              <span>Or continue with</span>
            </div>

            <div class="social-buttons">
              <button mat-stroked-button type="button" class="social-btn google-btn">
                <mat-icon>account_circle</mat-icon>
                Google
              </button>
              <button mat-stroked-button type="button" class="social-btn facebook-btn">
                <mat-icon>facebook</mat-icon>
                Facebook
              </button>
            </div>

            <p class="signup-prompt">
              Don't have an account? 
              <a routerLink="/register" class="signup-link">Sign up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background-color: #0f1419;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    
    .login-content {
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

    .login-form-section {
      text-align: left;
    }

    .welcome-title {
      color: #ffffff;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      text-align: center;
    }

    .welcome-subtitle {
      color: #9ca3af;
      font-size: 1rem;
      margin: 0 0 32px 0;
      text-align: center;
      line-height: 1.5;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .full-width {
      width: 100%;
    }

    .forgot-password {
      text-align: right;
    }

    .forgot-link {
      color: #9ca3af;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .forgot-link:hover {
      color: #00d26a;
      text-decoration: underline;
    }
    
    .login-btn {
      background: #00d26a !important;
      color: #000000 !important;
      height: 48px;
      font-weight: 600;
      font-size: 1rem;
      border-radius: 25px;
      text-transform: none;
      margin: 8px 0;
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 24px 0;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #2d3439;
      z-index: 1;
    }

    .divider span {
      background: #0f1419;
      padding: 0 16px;
      position: relative;
      z-index: 2;
    }

    .social-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .social-btn {
      flex: 1;
      padding: 12px;
      border: 1px solid #2d3439;
      color: #ffffff !important;
      background-color: #1e2328;
      border-radius: 8px;
      text-transform: none;
      font-weight: 500;
    }

    .social-btn:hover {
      background-color: #2d3439;
      border-color: #00d26a;
    }

    .signup-prompt {
      text-align: center;
      color: #9ca3af;
      font-size: 0.875rem;
      margin: 0;
    }

    .signup-link {
      color: #00d26a;
      text-decoration: underline;
      font-weight: 500;
    }

    .signup-link:hover {
      color: #00a855;
    }
    
    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
      }
      
      .welcome-title {
        font-size: 1.75rem;
      }

      .social-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Close', { duration: 5000 });
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}