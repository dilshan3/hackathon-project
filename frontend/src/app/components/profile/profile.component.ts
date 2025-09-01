import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Me } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="profile-container">
      <div class="profile-content" *ngIf="!isLoading && user; else loadingTemplate">
        <mat-card class="profile-card">
          <mat-card-header>
            <div class="profile-header">
              <div class="avatar">
                <mat-icon class="avatar-icon">person</mat-icon>
              </div>
              <div class="user-info">
                <mat-card-title>{{ user.displayName }}</mat-card-title>
                <mat-card-subtitle>{{ user.email }}</mat-card-subtitle>
              </div>
            </div>
          </mat-card-header>
          
          <mat-card-content class="profile-details">
            <div class="detail-row">
              <mat-icon class="detail-icon">email</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Email</span>
                <span class="detail-value">{{ user.email }}</span>
                <mat-chip-set>
                  <mat-chip [class]="user.emailVerified ? 'verified-chip' : 'unverified-chip'">
                    <mat-icon matChipAvatar>{{ user.emailVerified ? 'verified' : 'warning' }}</mat-icon>
                    {{ user.emailVerified ? 'Verified' : 'Unverified' }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>
            
            <div class="detail-row">
              <mat-icon class="detail-icon">person</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Display Name</span>
                <span class="detail-value">{{ user.displayName }}</span>
              </div>
            </div>
            
            <div class="detail-row" *ngIf="user.city">
              <mat-icon class="detail-icon">location_city</mat-icon>
              <div class="detail-content">
                <span class="detail-label">City</span>
                <span class="detail-value">{{ user.city }}</span>
              </div>
            </div>
            
            <div class="detail-row">
              <mat-icon class="detail-icon">schedule</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Member Since</span>
                <span class="detail-value">{{ formatDate(user.createdAt) }}</span>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions class="profile-actions">
            <button mat-raised-button routerLink="/profile/edit" class="edit-btn">
              <mat-icon>edit</mat-icon>
              Edit Profile
            </button>
            <button mat-button (click)="refreshProfile()" class="refresh-btn">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading profile...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: calc(100vh - 64px);
      background: #0f1419;
      padding: 24px;
    }
    
    .profile-content {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .profile-card {
      padding: 24px;
      background-color: #1e2328 !important;
      border: 1px solid #2d3439;
      color: #ffffff;
    }

    .profile-card mat-card-header mat-card-title {
      color: #ffffff;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .profile-card mat-card-header mat-card-subtitle {
      color: #9ca3af;
    }
    
    .profile-header {
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;
    }
    
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00d26a, #00a855);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .avatar-icon {
      color: #000000;
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }
    
    .user-info {
      flex: 1;
    }
    
    .profile-details {
      margin-top: 32px;
    }
    
    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      border-radius: 8px;
      background: #2d3439;
      border: 1px solid #3d4349;
    }
    
    .detail-icon {
      color: #00d26a;
      margin-top: 4px;
    }
    
    .detail-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .detail-label {
      font-size: 0.875rem;
      color: #9ca3af;
      font-weight: 500;
    }
    
    .detail-value {
      font-size: 1rem;
      color: #ffffff;
      font-weight: 400;
    }
    
    .verified-chip {
      background: rgba(0, 210, 106, 0.2) !important;
      color: #00d26a !important;
    }

    .verified-chip mat-icon {
      color: #00d26a !important;
    }
    
    .unverified-chip {
      background: rgba(245, 158, 11, 0.2) !important;
      color: #f59e0b !important;
    }

    .unverified-chip mat-icon {
      color: #f59e0b !important;
    }
    
    .profile-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-start;
      margin-top: 24px;
    }
    
    .edit-btn {
      background: #00d26a !important;
      color: #000000 !important;
    }
    
    .refresh-btn {
      color: #00d26a !important;
    }

    .refresh-btn:hover {
      color: #ffffff !important;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;
      color: #9ca3af;
    }

    .loading-container mat-spinner {
      --mdc-circular-progress-active-indicator-color: #00d26a;
    }
    
    @media (max-width: 768px) {
      .profile-container {
        padding: 16px;
      }
      
      .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }
      
      .profile-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: Me | null = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  refreshProfile(): void {
    this.loadProfile();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}