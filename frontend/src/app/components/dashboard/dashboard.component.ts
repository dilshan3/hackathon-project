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
      <div class="dashboard-header">
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dashboard-subtitle">Welcome back! Here's what's happening with your books.</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-container my-books">
            <mat-icon class="stat-icon">auto_stories</mat-icon>
          </div>
          <div class="stat-content">
            <h3 class="stat-title">My Books</h3>
            <p class="stat-number">{{ myBooksCount }}</p>
            <p class="stat-description">Books you're sharing</p>
          </div>
          <div class="stat-actions">
            <button mat-button routerLink="/books/mine" class="view-btn">View All</button>
            <button mat-raised-button routerLink="/books/add" color="primary" class="action-btn">Add Book</button>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-container incoming-requests">
            <mat-icon class="stat-icon" 
                      [matBadge]="counters.incomingPendingRequests" 
                      [matBadgeHidden]="counters.incomingPendingRequests === 0"
                      matBadgeColor="warn">inbox</mat-icon>
          </div>
          <div class="stat-content">
            <h3 class="stat-title">Incoming Requests</h3>
            <p class="stat-number">{{ counters.incomingPendingRequests }}</p>
            <p class="stat-description">People want your books</p>
          </div>
          <div class="stat-actions">
            <button mat-raised-button routerLink="/requests" [queryParams]="{tab: 'owner'}" color="primary" class="action-btn">
              View Requests
            </button>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-container my-requests">
            <mat-icon class="stat-icon"
                      [matBadge]="counters.myActiveRequests" 
                      [matBadgeHidden]="counters.myActiveRequests === 0"
                      matBadgeColor="accent">send</mat-icon>
          </div>
          <div class="stat-content">
            <h3 class="stat-title">My Requests</h3>
            <p class="stat-number">{{ counters.myActiveRequests }}</p>
            <p class="stat-description">Books you've requested</p>
          </div>
          <div class="stat-actions">
            <button mat-raised-button routerLink="/requests" [queryParams]="{tab: 'requester'}" color="primary" class="action-btn">
              View My Requests
            </button>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-container discover">
            <mat-icon class="stat-icon">search</mat-icon>
          </div>
          <div class="stat-content">
            <h3 class="stat-title">Discover Books</h3>
            <p class="stat-number">∞</p>
            <p class="stat-description">Find books to borrow</p>
          </div>
          <div class="stat-actions">
            <button mat-raised-button routerLink="/books" color="primary" class="action-btn">
              Browse Books
            </button>
          </div>
        </div>
      </div>

      <div class="recent-section" *ngIf="recentBooks.length > 0">
        <h2 class="section-title">Recently Added Books</h2>
        <div class="books-grid">
          <div *ngFor="let book of recentBooks" class="book-card">
            <div class="book-content">
              <h4 class="book-title">{{ book.title }}</h4>
              <p class="book-author" *ngIf="book.author">by {{ book.author }}</p>
              <div class="book-meta">
                <span class="condition-badge" [class]="'condition-' + book.condition.toLowerCase()">
                  {{ book.condition }}
                </span>
                <span class="status-badge" [class]="'status-' + book.status.toLowerCase()">
                  {{ book.status }}
                </span>
              </div>
            </div>
            <div class="book-actions">
              <button mat-button [routerLink]="['/books', book.id]" class="view-btn">View</button>
              <button mat-button [routerLink]="['/books', book.id, 'edit']" class="edit-btn">Edit</button>
            </div>
          </div>
        </div>
      </div>

      <div class="recent-section" *ngIf="recentRequests.length > 0">
        <h2 class="section-title">Recent Activity</h2>
        <div class="requests-list">
          <div *ngFor="let request of recentRequests" class="request-card">
            <div class="request-content">
              <div class="request-header">
                <h4 class="request-title">{{ request.book?.title }}</h4>
                <span class="status-badge" [class]="'status-' + request.status.toLowerCase()">
                  {{ request.status }}
                </span>
              </div>
              <p class="request-meta">
                <span *ngIf="request.requester">From: {{ request.requester.displayName }}</span>
                <span *ngIf="request.owner">To: {{ request.owner.displayName }}</span>
                <span class="date">{{ request.createdAt | date }}</span>
              </p>
            </div>
            <div class="request-actions">
              <button mat-button [routerLink]="['/requests', request.id]" class="view-btn">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: calc(100vh - 64px);
      background-color: #0f1419;
      padding: 32px 24px;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .dashboard-title {
      color: #ffffff;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 16px 0;
    }

    .dashboard-subtitle {
      color: #9ca3af;
      font-size: 1.125rem;
      margin: 0;
      line-height: 1.6;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }

    .stat-card {
      background: #1e2328;
      border: 1px solid #2d3439;
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      border-color: #00d26a;
      box-shadow: 0 12px 32px rgba(0, 210, 106, 0.15);
    }

    .stat-icon-container {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .stat-icon-container.my-books {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }

    .stat-icon-container.incoming-requests {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .stat-icon-container.my-requests {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }

    .stat-icon-container.discover {
      background: linear-gradient(135deg, #00d26a, #00a855);
    }

    .stat-icon {
      color: #ffffff;
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-title {
      color: #ffffff;
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .stat-number {
      color: #00d26a;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 4px 0;
    }

    .stat-description {
      color: #9ca3af;
      font-size: 0.875rem;
      margin: 0;
    }

    .stat-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .view-btn {
      color: #9ca3af !important;
      text-transform: none;
      font-weight: 500;
    }

    .view-btn:hover {
      color: #ffffff !important;
    }

    .action-btn {
      background: #00d26a !important;
      color: #000000 !important;
      text-transform: none;
      font-weight: 600;
      border-radius: 8px;
    }

    .edit-btn {
      color: #00d26a !important;
      text-transform: none;
      font-weight: 500;
    }

    .recent-section {
      margin-bottom: 48px;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }

    .section-title {
      color: #ffffff;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 24px 0;
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .book-card {
      background: #1e2328;
      border: 1px solid #2d3439;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
    }

    .book-card:hover {
      border-color: #00d26a;
      box-shadow: 0 8px 24px rgba(0, 210, 106, 0.15);
    }

    .book-content {
      margin-bottom: 16px;
    }

    .book-title {
      color: #ffffff;
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .book-author {
      color: #9ca3af;
      font-size: 0.875rem;
      margin: 0 0 12px 0;
    }

    .book-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .book-actions {
      display: flex;
      gap: 12px;
    }

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .request-card {
      background: #1e2328;
      border: 1px solid #2d3439;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;
    }

    .request-card:hover {
      border-color: #00d26a;
      box-shadow: 0 8px 24px rgba(0, 210, 106, 0.15);
    }

    .request-content {
      flex: 1;
    }

    .request-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .request-title {
      color: #ffffff;
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .request-meta {
      color: #9ca3af;
      font-size: 0.875rem;
      margin: 0;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .date {
      color: #6b7280;
    }

    .request-actions {
      margin-left: 16px;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 24px 16px;
      }

      .dashboard-title {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .stat-actions {
        flex-direction: column;
      }

      .books-grid {
        grid-template-columns: 1fr;
      }

      .request-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .request-actions {
        margin-left: 0;
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
