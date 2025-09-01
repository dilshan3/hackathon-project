import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { HealthResponse } from '../../models/health.model';

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
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Share Books, Build Community
            </h1>
            <p class="hero-subtitle">
              Connect with fellow book lovers in your neighborhood. 
              Share your favorite reads and discover new stories through ReadLoop.
            </p>
            <div class="hero-actions">
              <a mat-raised-button routerLink="/register" class="cta-primary">
                <mat-icon>person_add</mat-icon>
                Get Started
              </a>
              <a mat-button routerLink="/login" class="cta-secondary">
                Sign In
              </a>
            </div>
          </div>
          <div class="hero-visual">
            <mat-icon class="hero-icon">auto_stories</mat-icon>
          </div>
        </div>
      </section>
      
      <section class="features-section">
        <div class="features-container">
          <h2 class="features-title">How ReadLoop Works</h2>
          <div class="features-grid">
            <mat-card class="feature-card">
              <mat-card-content>
                <mat-icon class="feature-icon">group</mat-icon>
                <h3>Join Your Community</h3>
                <p>Connect with book lovers in your local area and build meaningful reading relationships.</p>
              </mat-card-content>
            </mat-card>
            
            <mat-card class="feature-card">
              <mat-card-content>
                <mat-icon class="feature-icon">swap_horiz</mat-icon>
                <h3>Share & Discover</h3>
                <p>Share books you've enjoyed and discover new titles recommended by your neighbors.</p>
              </mat-card-content>
            </mat-card>
            
            <mat-card class="feature-card">
              <mat-card-content>
                <mat-icon class="feature-icon">eco</mat-icon>
                <h3>Sustainable Reading</h3>
                <p>Reduce waste and save money by giving books a second life in your community.</p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: calc(100vh - 64px);
    }
    
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 24px;
      min-height: 60vh;
      display: flex;
      align-items: center;
    }
    
    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }
    
    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin: 0 0 24px 0;
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      line-height: 1.6;
      margin: 0 0 32px 0;
      opacity: 0.9;
    }
    
    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .cta-primary {
      background: #4CAF50;
      color: white;
      padding: 12px 32px;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .cta-secondary {
      color: white;
      border: 2px solid white;
      padding: 12px 32px;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .hero-icon {
      font-size: 12rem;
      width: 12rem;
      height: 12rem;
      opacity: 0.8;
    }
    
    .features-section {
      padding: 80px 24px;
      background: #f8f9fa;
    }
    
    .features-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .features-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 600;
      margin: 0 0 48px 0;
      color: #333;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
    }
    
    .feature-card {
      text-align: center;
      padding: 32px 24px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .feature-icon {
      color: #4CAF50;
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 16px;
    }
    
    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #333;
    }
    
    .feature-card p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: 40px;
        text-align: center;
      }
      
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-icon {
        font-size: 8rem;
        width: 8rem;
        height: 8rem;
      }
      
      .features-title {
        font-size: 2rem;
      }
      
      .hero-actions {
        justify-content: center;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  healthData: HealthResponse | null = null;
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkHealth();
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