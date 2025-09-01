import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CounterService } from '../../services/counter.service';
import { User } from '../../models/user.model';
import { Counters } from '../../models/common.model';

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
    MatDividerModule,
    MatBadgeModule
  ],
  template: `
    <mat-toolbar class="navigation-toolbar">
      <div class="nav-container">
        <div class="nav-brand">
          <mat-icon class="brand-icon">auto_stories</mat-icon>
          <span class="brand-text">ReadLoop</span>
        </div>
        
        <nav class="nav-links" *ngIf="currentUser">
          <a mat-button routerLink="/books" routerLinkActive="active" class="nav-link">Discover</a>
          <a mat-button routerLink="/books/mine" routerLinkActive="active" class="nav-link">My Books</a>
          <a mat-button routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
          <a mat-button routerLink="/requests" 
             [matBadge]="getTotalNotificationCount()" 
             [matBadgeHidden]="getTotalNotificationCount() === 0"
             matBadgeColor="warn"
             matBadgeSize="small"
             routerLinkActive="active"
             class="nav-link">
            Requests
          </a>
        </nav>
        
        <div class="nav-actions">
          <ng-container *ngIf="currentUser; else guestActions">
            <button mat-icon-button class="notification-btn">
              <mat-icon>notifications</mat-icon>
            </button>
            <button mat-icon-button [matMenuTriggerFor]="userMenu" class="profile-btn">
              <div class="profile-avatar">
                <span>{{ getUserInitials() }}</span>
              </div>
            </button>
            <mat-menu #userMenu="matMenu" class="user-menu">
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
            <a mat-button routerLink="/login" class="login-btn">Log In</a>
            <a mat-raised-button routerLink="/register" class="signup-btn">Sign Up</a>
          </ng-template>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navigation-toolbar {
      background: #16191d;
      color: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      height: 64px;
    }
    
    .nav-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      height: 100%;
    }
    
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
    }
    
    .brand-icon {
      color: #00d26a;
      font-size: 1.8rem;
      width: 1.8rem;
      height: 1.8rem;
    }
    
    .nav-links {
      display: flex;
      gap: 32px;
      align-items: center;
    }
    
    .nav-link {
      color: #9ca3af !important;
      font-weight: 500;
      font-size: 16px;
      text-transform: none;
      padding: 8px 16px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    
    .nav-link:hover {
      color: #ffffff !important;
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .nav-link.active {
      color: #ffffff !important;
      background-color: rgba(0, 210, 106, 0.1);
    }
    
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .login-btn {
      color: #9ca3af !important;
      font-weight: 500;
      text-transform: none;
    }
    
    .login-btn:hover {
      color: #ffffff !important;
    }
    
    .signup-btn {
      background: #00d26a !important;
      color: #000000 !important;
      font-weight: 600;
      text-transform: none;
      border-radius: 25px;
      padding: 8px 24px;
    }
    
    .notification-btn {
      color: #9ca3af;
    }
    
    .notification-btn:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .profile-btn {
      padding: 0;
    }
    
    .profile-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00d26a, #00a855);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000000;
      font-weight: 600;
      font-size: 14px;
    }
    
    .user-menu .mat-mdc-menu-panel {
      background-color: #1e2328;
      border: 1px solid #2d3439;
    }
    
    .user-info {
      padding: 16px;
      border-bottom: 1px solid #2d3439;
      background-color: #1e2328;
    }
    
    .user-name {
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #ffffff !important;
    }
    
    .user-email {
      color: #9ca3af !important;
      font-size: 0.875rem;
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      
      .nav-container {
        padding: 0 16px;
      }
      
      .nav-brand {
        font-size: 1.25rem;
      }
    }
  `]
})
export class NavigationComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  counters: Counters = { incomingPendingRequests: 0, myActiveRequests: 0 };
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private counterService: CounterService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.counterService.counters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(counters => {
        this.counters = counters;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }

  getTotalNotificationCount(): number {
    return this.counters.incomingPendingRequests + this.counters.myActiveRequests;
  }

  getUserInitials(): string {
    if (!this.currentUser?.displayName) return 'U';
    return this.currentUser.displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}