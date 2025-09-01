import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { HealthResponse } from '../../models/health.model';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="health-container">
      <mat-card class="health-card">
        <mat-card-header>
          <div class="header-content">
            <mat-icon class="health-icon" [class]="getStatusIconClass()">
              {{ getStatusIcon() }}
            </mat-icon>
            <div>
              <mat-card-title>System Health</mat-card-title>
              <mat-card-subtitle>ReadLoop API Status</mat-card-subtitle>
            </div>
          </div>
        </mat-card-header>
        
        <mat-card-content *ngIf="!isLoading && healthData; else loadingTemplate">
          <div class="health-details">
            <div class="status-row">
              <span class="status-label">Status:</span>
              <span class="status-value" [class]="getStatusClass()">
                {{ healthData.status.toUpperCase() }}
              </span>
            </div>
            
            <div class="status-row">
              <span class="status-label">Last Check:</span>
              <span class="status-value">{{ formatTime(healthData.time) }}</span>
            </div>
            
            <div class="status-row">
              <span class="status-label">Response Time:</span>
              <span class="status-value">{{ responseTime }}ms</span>
            </div>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button (click)="checkHealth()" [disabled]="isLoading" class="refresh-btn">
            <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
            <mat-icon *ngIf="!isLoading">refresh</mat-icon>
            <span *ngIf="!isLoading">Check Again</span>
          </button>
        </mat-card-actions>
        
        <ng-template #loadingTemplate>
          <mat-card-content>
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Checking system health...</p>
            </div>
          </mat-card-content>
        </ng-template>
      </mat-card>
    </div>
  `,
  styles: [`
    .health-container {
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .health-card {
      width: 100%;
      max-width: 500px;
      padding: 24px;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }
    
    .health-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }
    
    .health-icon.healthy {
      color: #4CAF50;
    }
    
    .health-icon.unhealthy {
      color: #f44336;
    }
    
    .health-icon.unknown {
      color: #ff9800;
    }
    
    .health-details {
      margin-top: 24px;
    }
    
    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .status-row:last-child {
      border-bottom: none;
    }
    
    .status-label {
      font-weight: 500;
      color: #666;
    }
    
    .status-value {
      font-weight: 600;
    }
    
    .status-value.healthy {
      color: #4CAF50;
    }
    
    .status-value.unhealthy {
      color: #f44336;
    }
    
    .refresh-btn {
      background: #4CAF50;
      color: white;
      margin-top: 16px;
    }
    
    .refresh-btn:disabled {
      background: #cccccc;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px 0;
      color: #666;
    }
  `]
})
export class HealthComponent implements OnInit {
  healthData: HealthResponse | null = null;
  isLoading = false;
  responseTime = 0;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth(): void {
    this.isLoading = true;
    const startTime = Date.now();
    
    this.apiService.getHealth().subscribe({
      next: (response) => {
        this.responseTime = Date.now() - startTime;
        this.healthData = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.responseTime = Date.now() - startTime;
        this.snackBar.open('Failed to check system health', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  getStatusIcon(): string {
    if (!this.healthData) return 'help';
    return this.healthData.status === 'ok' ? 'check_circle' : 'error';
  }

  getStatusIconClass(): string {
    if (!this.healthData) return 'unknown';
    return this.healthData.status === 'ok' ? 'healthy' : 'unhealthy';
  }

  getStatusClass(): string {
    if (!this.healthData) return '';
    return this.healthData.status === 'ok' ? 'healthy' : 'unhealthy';
  }

  formatTime(timeString: string): string {
    return new Date(timeString).toLocaleString();
  }
}