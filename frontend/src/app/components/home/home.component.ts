import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HealthResponse } from '../../models/health.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section for Authenticated Users -->
      <section class="hero-section" *ngIf="currentUser">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Share Books, Build Community
            </h1>
            <p class="hero-subtitle">
              Connect with fellow book lovers in your neighborhood. Share your favorite reads and discover new stories through ReadLoop.
            </p>
            <div class="hero-actions">
              <a mat-raised-button routerLink="/books" class="cta-primary">
                Browse Books
              </a>
              <a mat-button routerLink="/books/add" class="cta-secondary">
                Share a Book
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Login Section for Guest Users -->
      <section class="login-section" *ngIf="!currentUser">
        <div class="login-container">
          <div class="login-content">
            <h1 class="welcome-title">Welcome back</h1>
            <p class="welcome-subtitle">Sign in to continue your book sharing journey.</p>
            
            <div class="login-actions">
              <a mat-raised-button routerLink="/login" class="login-primary">
                Log In
              </a>
              <div class="login-divider">
                <span>Or continue with</span>
              </div>
              <div class="social-buttons">
                <button mat-stroked-button class="social-btn google-btn">
                  <mat-icon>account_circle</mat-icon>
                  Google
                </button>
                <button mat-stroked-button class="social-btn facebook-btn">
                  <mat-icon>facebook</mat-icon>
                  Facebook
                </button>
              </div>
              <p class="signup-prompt">
                Don't have an account? 
                <a routerLink="/register" class="signup-link">Sign up</a>
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="features-section">
        <div class="features-container">
          <h2 class="features-title">How ReadLoop Works</h2>
          <p class="features-subtitle">It's simple to get started and share books with others in the community.</p>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon-container">
                <mat-icon class="feature-icon">library_books</mat-icon>
              </div>
              <h3>Share Your Books</h3>
              <p>Easily add books you're ready to share with your community.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon-container">
                <mat-icon class="feature-icon">search</mat-icon>
              </div>
              <h3>Share & Discover</h3>
              <p>Explore a diverse collection of books shared by other members.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon-container">
                <mat-icon class="feature-icon">share</mat-icon>
              </div>
              <h3>Request and Enjoy</h3>
              <p>Request a book, and once approved, enjoy your new read!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: calc(100vh - 64px);
      background-color: #0f1419;
    }
    
    .hero-section {
      background: linear-gradient(135deg, #16191d 0%, #1e2328 100%);
      color: white;
      padding: 80px 24px;
      min-height: 60vh;
      display: flex;
      align-items: center;
    }
    
    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }
    
    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin: 0 0 24px 0;
      background: linear-gradient(135deg, #ffffff 0%, #00d26a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      line-height: 1.6;
      margin: 0 0 32px 0;
      color: #9ca3af;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .hero-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .cta-primary {
      background: #00d26a !important;
      color: #000000 !important;
      padding: 16px 32px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 25px;
      text-transform: none;
    }
    
    .cta-secondary {
      color: #ffffff !important;
      border: 2px solid #ffffff;
      padding: 16px 32px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 25px;
      text-transform: none;
    }

    /* Login Section Styles */
    .login-section {
      background-color: #0f1419;
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
    }

    .login-container {
      max-width: 400px;
      width: 100%;
    }

    .login-content {
      text-align: center;
    }

    .welcome-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 16px 0;
    }

    .welcome-subtitle {
      font-size: 1rem;
      color: #9ca3af;
      margin: 0 0 40px 0;
      line-height: 1.6;
    }

    .login-actions {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .login-primary {
      background: #00d26a !important;
      color: #000000 !important;
      padding: 16px 32px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 25px;
      text-transform: none;
      width: 100%;
    }

    .login-divider {
      position: relative;
      text-align: center;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    .login-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #2d3439;
      z-index: 1;
    }

    .login-divider span {
      background: #0f1419;
      padding: 0 16px;
      position: relative;
      z-index: 2;
    }

    .social-buttons {
      display: flex;
      gap: 12px;
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
    
    /* Features Section */
    .features-section {
      padding: 80px 24px;
      background: #16191d;
    }
    
    .features-container {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }
    
    .features-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 16px 0;
      color: #ffffff;
    }

    .features-subtitle {
      font-size: 1.125rem;
      color: #9ca3af;
      margin: 0 0 48px 0;
      line-height: 1.6;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 40px;
      margin-top: 48px;
    }
    
    .feature-card {
      text-align: center;
      padding: 40px 24px;
      background: #1e2328;
      border: 1px solid #2d3439;
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-8px);
      border-color: #00d26a;
      box-shadow: 0 12px 32px rgba(0, 210, 106, 0.15);
    }

    .feature-icon-container {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #00d26a, #00a855);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .feature-icon {
      color: #000000;
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }
    
    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #ffffff;
    }
    
    .feature-card p {
      color: #9ca3af;
      line-height: 1.6;
      margin: 0;
      font-size: 1rem;
    }
    
    @media (max-width: 768px) {
      .hero-title, .welcome-title {
        font-size: 2.5rem;
      }
      
      .features-title {
        font-size: 2rem;
      }
      
      .hero-actions {
        flex-direction: column;
        align-items: center;
      }

      .social-buttons {
        flex-direction: column;
      }

      .login-container {
        max-width: 100%;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  healthData: HealthResponse | null = null;
  currentUser: User | null = null;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkHealth();
    
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkHealth(): void {
    this.isLoading = true;
    this.apiService.getHealth().subscribe({
      next: (response: HealthResponse) => {
        this.healthData = response;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}