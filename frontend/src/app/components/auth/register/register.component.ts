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
import { RegisterRequest } from '../../../models/auth-request.model';

@Component({
  selector: 'app-register',
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
    <div class="register-container">
      <div class="register-content">
        <div class="brand-section">
          <mat-icon class="brand-icon">auto_stories</mat-icon>
          <h1 class="brand-name">ReadLoop</h1>
        </div>
        
        <div class="form-section">
          <h2 class="title">Join ReadLoop</h2>
          <p class="subtitle">Create your account to start sharing books with your community.</p>
          
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Display Name</mat-label>
              <input matInput formControlName="displayName" placeholder="Enter your display name">
              <mat-error *ngIf="registerForm.get('displayName')?.hasError('required')">
                Display name is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('displayName')?.hasError('minlength')">
                Display name must be at least 2 characters
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email">
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Create a password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Password must be at least 8 characters
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
                Password must contain uppercase, lowercase, number, and special character
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>City (Optional)</mat-label>
              <input matInput formControlName="city" placeholder="Enter your city">
            </mat-form-field>
            
            <button mat-raised-button color="primary" type="submit" class="submit-btn full-width" 
                    [disabled]="registerForm.invalid || isLoading">
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              <span *ngIf="!isLoading">Create Account</span>
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

            <p class="login-prompt">
              Already have an account? 
              <a routerLink="/login" class="login-link">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      background-color: #0f1419;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    
    .register-content {
      max-width: 450px;
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
    
    .register-form {
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

    .login-prompt {
      text-align: center;
      color: #9ca3af;
      font-size: 0.875rem;
      margin: 0;
    }

    .login-link {
      color: #00d26a;
      text-decoration: underline;
      font-weight: 500;
    }

    .login-link:hover {
      color: #00a855;
    }
    
    @media (max-width: 480px) {
      .register-container {
        padding: 16px;
      }
      
      .title {
        font-size: 1.5rem;
      }

      .social-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      city: ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const formValue = this.registerForm.value;
      const registerRequest = {
        ...formValue,
        city: formValue.city || undefined
      };
      
      this.authService.register(registerRequest).subscribe({
        next: () => {
          this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/profile']);
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