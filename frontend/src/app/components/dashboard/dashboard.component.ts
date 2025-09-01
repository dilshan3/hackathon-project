import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { BookService } from '../../services/book.service';
import { RequestService } from '../../services/request.service';
import { CounterService } from '../../services/counter.service';
import { Book } from '../../models/book.model';
import { BookRequest } from '../../models/request.model';
import { Counters } from '../../models/common.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatBadgeModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>auto_stories</mat-icon>
            </div>
            <div class="stat-info">
              <h3>My Books</h3>
              <p class="stat-number">{{ myBooksCount }}</p>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/books/mine">View All</button>
            <button mat-raised-button routerLink="/books/add" color="primary">Add Book</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon [matBadge]="counters.incomingPendingRequests" 
                        [matBadgeHidden]="counters.incomingPendingRequests === 0"
                        matBadgeColor="warn">inbox</mat-icon>
            </div>
            <div class="stat-info">
              <h3>Incoming Requests</h3>
              <p class="stat-number">{{ counters.incomingPendingRequests }}</p>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/requests" [queryParams]="{tab: 'owner'}">
              View Requests
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon [matBadge]="counters.myActiveRequests" 
                        [matBadgeHidden]="counters.myActiveRequests === 0"
                        matBadgeColor="accent">send</mat-icon>
            </div>
            <div class="stat-info">
              <h3>My Requests</h3>
              <p class="stat-number">{{ counters.myActiveRequests }}</p>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/requests" [queryParams]="{tab: 'requester'}">
              View My Requests
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>search</mat-icon>
            </div>
            <div class="stat-info">
              <h3>Discover Books</h3>
              <p class="stat-description">Find books to borrow</p>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button routerLink="/books" color="accent">
              Browse Books
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="recent-section" *ngIf="recentBooks.length > 0">
        <h2>Recently Added Books</h2>
        <div class="books-grid">
          <mat-card *ngFor="let book of recentBooks" class="book-card">
            <mat-card-content>
              <h4>{{ book.title }}</h4>
              <p *ngIf="book.author">by {{ book.author }}</p>
              <div class="book-meta">
                <span class="condition-badge" [class]="'condition-' + book.condition.toLowerCase()">
                  {{ book.condition }}
                </span>
                <span class="status-badge" [class]="'status-' + book.status.toLowerCase()">
                  {{ book.status }}
                </span>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button [routerLink]="['/books', book.id]">View</button>
              <button mat-button [routerLink]="['/books', book.id, 'edit']">Edit</button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <div class="recent-section" *ngIf="recentRequests.length > 0">
        <h2>Recent Activity</h2>
        <div class="requests-list">
          <mat-card *ngFor="let request of recentRequests" class="request-card">
            <mat-card-content>
              <div class="request-header">
                <h4>{{ request.book?.title }}</h4>
                <span class="status-badge" [class]="'status-' + request.status.toLowerCase()">
                  {{ request.status }}
                </span>
              </div>
              <p class="request-meta">
                <span *ngIf="request.requester">From: {{ request.requester.displayName }}</span>
                <span *ngIf="request.owner">To: {{ request.owner.displayName }}</span>
                <span class="date">{{ request.createdAt | date }}</span>
              </p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button [routerLink]="['/requests', request.id]">View Details</button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 32px;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .stat-card {
      transition: transform 0.2s ease-in-out;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
    }

    .stat-icon {
      background: #f5f5f5;
      border-radius: 50%;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #4CAF50;
    }

    .stat-info h3 {
      margin: 0 0 8px 0;
      color: #666;
      font-weight: 500;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: #333;
    }

    .stat-description {
      color: #666;
      margin: 0;
    }

    .recent-section {
      margin-bottom: 48px;
    }

    .recent-section h2 {
      margin-bottom: 24px;
      color: #333;
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .book-card h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .book-card p {
      margin: 0 0 16px 0;
      color: #666;
    }

    .book-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .condition-badge, .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .condition-new { background: #e8f5e8; color: #2e7d32; }
    .condition-good { background: #e3f2fd; color: #1976d2; }
    .condition-fair { background: #fff3e0; color: #f57c00; }
    .condition-poor { background: #ffebee; color: #d32f2f; }

    .status-available { background: #e8f5e8; color: #2e7d32; }
    .status-lent { background: #fff3e0; color: #f57c00; }
    .status-not_available { background: #ffebee; color: #d32f2f; }

    .status-pending { background: #fff3e0; color: #f57c00; }
    .status-approved { background: #e8f5e8; color: #2e7d32; }
    .status-declined { background: #ffebee; color: #d32f2f; }
    .status-completed { background: #e3f2fd; color: #1976d2; }

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .request-card .request-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .request-card h4 {
      margin: 0;
      color: #333;
    }

    .request-meta {
      color: #666;
      font-size: 0.875rem;
      margin: 0;
      display: flex;
      gap: 16px;
    }

    .date {
      margin-left: auto;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .stat-card mat-card-content {
        padding: 16px;
      }

      .books-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  myBooksCount = 0;
  counters: Counters = { incomingPendingRequests: 0, myActiveRequests: 0 };
  recentBooks: Book[] = [];
  recentRequests: BookRequest[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private bookService: BookService,
    private requestService: RequestService,
    private counterService: CounterService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    
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

  private loadDashboardData(): void {
    forkJoin({
      myBooks: this.bookService.getMyBooks(1, 5),
      ownerRequests: this.requestService.getRequests('owner', undefined, 1, 3),
      requesterRequests: this.requestService.getRequests('requester', undefined, 1, 3)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.myBooksCount = data.myBooks.total;
        this.recentBooks = data.myBooks.items;
        
        // Combine and sort recent requests
        const allRequests = [...data.ownerRequests.items, ...data.requesterRequests.items];
        this.recentRequests = allRequests
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }
}
