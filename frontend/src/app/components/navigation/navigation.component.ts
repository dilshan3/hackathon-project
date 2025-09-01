import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="navigation-toolbar">
      <div class="nav-container">
        <div class="nav-brand">
          <mat-icon class="brand-icon">auto_stories</mat-icon>
          <span class="brand-text">ReadLoop</span>
        </div>
        
        <nav class="nav-links" *ngIf="currentUser">
          <a mat-button routerLink="/profile" routerLinkActive="active">Profile</a>
          <a mat-button routerLink="/health" routerLinkActive="active">Health</a>
        </nav>
        
        <div class="nav-actions">
          <ng-container *ngIf="currentUser; else guestActions">
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="user-info">
                <p class="user-name">{{ currentUser.displayName }}</p>
                <p class="user-email">{{ currentUser.email }}</p>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </ng-container>
          
          <ng-template #guestActions>
            <a mat-button routerLink="/login" class="login-btn">Login</a>
            <a mat-raised-button routerLink="/register" class="register-btn">Sign Up</a>
          </ng-template>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navigation-toolbar {
      background: #1a1a1a;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .nav-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }
    
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .brand-icon {
      color: #4CAF50;
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }
    
    .nav-links {
      display: flex;
      gap: 16px;
    }
    
    .nav-links a.active {
      background: rgba(76, 175, 80, 0.1);
      color: #4CAF50;
    }
    
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .login-btn {
      color: white;
    }
    
    .register-btn {
      background: #4CAF50;
      color: white;
    }
    
    .user-info {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .user-name {
      font-weight: 600;
      margin: 0 0 4px 0;
    }
    
    .user-email {
      color: #666;
      font-size: 0.875rem;
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      
      .nav-container {
        padding: 0 8px;
      }
    }
  `]
})
export class NavigationComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
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

  logout(): void {
    this.authService.logout();
  }
}