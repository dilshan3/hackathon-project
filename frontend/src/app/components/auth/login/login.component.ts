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
      <mat-card class="login-card">
        <mat-card-header>
          <div class="header-content">
            <mat-icon class="brand-icon">auto_stories</mat-icon>
            <div>
              <mat-card-title>Welcome Back</mat-card-title>
              <mat-card-subtitle>Sign in to ReadLoop</mat-card-subtitle>
            </div>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter your password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>
            
            <button mat-raised-button type="submit" class="submit-btn full-width" 
                    [disabled]="loginForm.invalid || isLoading">
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              <span *ngIf="!isLoading">Sign In</span>
            </button>
          </form>
        </mat-card-content>
        
        <mat-card-actions class="card-actions">
          <p class="signup-link">
            Don't have an account? 
            <a routerLink="/register" class="link">Sign up here</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }
    
    .brand-icon {
      color: #4CAF50;
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .submit-btn {
      background: #4CAF50;
      color: white;
      height: 48px;
      font-weight: 600;
      margin-top: 16px;
    }
    
    .submit-btn:disabled {
      background: #cccccc;
    }
    
    .card-actions {
      justify-content: center;
      padding-top: 16px;
    }
    
    .signup-link {
      text-align: center;
      margin: 0;
      color: #666;
    }
    
    .link {
      color: #4CAF50;
      text-decoration: none;
      font-weight: 500;
    }
    
    .link:hover {
      text-decoration: underline;
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