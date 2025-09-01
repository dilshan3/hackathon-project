import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { BookService } from '../../../services/book.service';
import { AuthService } from '../../../services/auth.service';
import { CreateRequestComponent } from '../../requests/create-request/create-request.component';
import { Book } from '../../../models/book.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="book-details-container">
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading book details...</p>
      </div>

      <div *ngIf="!isLoading && !book" class="error-state">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3>Book not found</h3>
        <p>The book you're looking for doesn't exist or has been removed.</p>
        <button mat-raised-button color="primary" routerLink="/books">
          Browse Books
        </button>
      </div>

      <div *ngIf="!isLoading && book" class="book-content">
        <div class="book-header">
          <button mat-icon-button (click)="goBack()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-actions" *ngIf="isOwner">
            <button mat-button color="accent" [routerLink]="['/books', book.id, 'edit']">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
          </div>
        </div>

        <mat-card class="book-card">
          <mat-card-content>
            <div class="book-info">
              <div class="book-main">
                <h1 class="book-title">{{ book.title }}</h1>
                
                <div class="book-meta">
                  <div class="meta-item" *ngIf="book.author">
                    <mat-icon>person</mat-icon>
                    <span>{{ book.author }}</span>
                  </div>
                  
                  <div class="meta-item" *ngIf="book.genre">
                    <mat-icon>category</mat-icon>
                    <span>{{ book.genre }}</span>
                  </div>
                  
                  <div class="meta-item">
                    <mat-icon>schedule</mat-icon>
                    <span>Added {{ book.createdAt | date:'longDate' }}</span>
                  </div>
                </div>

                <div class="book-badges">
                  <mat-chip [class]="'condition-' + book.condition.toLowerCase()">
                    <mat-icon>star</mat-icon>
                    {{ book.condition }}
                  </mat-chip>
                  <mat-chip [class]="'status-' + book.status.toLowerCase()">
                    <mat-icon>info</mat-icon>
                    {{ book.status }}
                  </mat-chip>
                </div>
              </div>

              <div class="book-owner" *ngIf="book.owner && !isOwner">
                <h3>Book Owner</h3>
                <div class="owner-info">
                  <mat-icon class="owner-avatar">account_circle</mat-icon>
                  <div class="owner-details">
                    <p class="owner-name">{{ book.owner.displayName }}</p>
                    <p class="owner-location" *ngIf="book.owner.city">
                      <mat-icon>location_on</mat-icon>
                      {{ book.owner.city }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="availability-section">
              <h3>Availability</h3>
              <div class="availability-status">
                <mat-icon [class]="'status-icon status-' + book.status.toLowerCase()">
                  {{ getStatusIcon() }}
                </mat-icon>
                <div class="status-info">
                  <p class="status-text">{{ getStatusText() }}</p>
                  <p class="status-description">{{ getStatusDescription() }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions class="book-actions">
            <ng-container *ngIf="isOwner">
              <button mat-button [routerLink]="['/books', book.id, 'edit']" color="accent">
                <mat-icon>edit</mat-icon>
                Edit Book
              </button>
              <button mat-button routerLink="/books/mine">
                <mat-icon>list</mat-icon>
                My Books
              </button>
            </ng-container>

            <ng-container *ngIf="!isOwner">
              <button mat-button routerLink="/books">
                <mat-icon>arrow_back</mat-icon>
                Back to Browse
              </button>
              
              <button *ngIf="canRequest" 
                      mat-raised-button 
                      color="primary" 
                      (click)="onRequestBook()">
                <mat-icon>send</mat-icon>
                Request This Book
              </button>
              
              <span *ngIf="!canRequest && currentUser" class="unavailable-message">
                {{ getUnavailableMessage() }}
              </span>
              
              <button *ngIf="!currentUser" 
                      mat-raised-button 
                      color="primary" 
                      routerLink="/login">
                <mat-icon>login</mat-icon>
                Login to Request
              </button>
            </ng-container>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .book-details-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
      min-height: calc(100vh - 64px);
      background-color: #0f1419;
    }

    .loading-container,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 64px;
      text-align: center;
      color: #9ca3af;
    }

    .loading-container mat-spinner {
      --mdc-circular-progress-active-indicator-color: #00d26a;
    }

    .error-state h3 {
      color: #ffffff;
    }

    .error-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ef4444;
    }

    .book-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .back-button {
      color: #9ca3af;
    }

    .back-button:hover {
      color: #ffffff;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .header-actions button {
      color: #00d26a !important;
    }

    .book-card {
      background-color: #1e2328 !important;
      border: 1px solid #2d3439;
      color: #ffffff;
      box-shadow: 0 8px 24px rgba(0, 210, 106, 0.15);
    }

    .book-info {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
      margin-bottom: 32px;
    }

    .book-title {
      margin: 0 0 24px 0;
      font-size: 2rem;
      font-weight: 600;
      color: #ffffff;
      line-height: 1.2;
    }

    .book-meta {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #9ca3af;
    }

    .meta-item mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
      color: #00d26a;
    }

    .book-badges {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .book-badges mat-chip {
      font-weight: 500;
    }

    .book-badges mat-chip mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      margin-right: 4px;
    }

    .condition-new { 
      background-color: rgba(0, 210, 106, 0.2) !important; 
      color: #00d26a !important; 
      border: 1px solid #00d26a;
    }
    .condition-good { 
      background-color: rgba(59, 130, 246, 0.2) !important; 
      color: #3b82f6 !important; 
      border: 1px solid #3b82f6;
    }
    .condition-fair { 
      background-color: rgba(245, 158, 11, 0.2) !important; 
      color: #f59e0b !important; 
      border: 1px solid #f59e0b;
    }
    .condition-poor { 
      background-color: rgba(239, 68, 68, 0.2) !important; 
      color: #ef4444 !important; 
      border: 1px solid #ef4444;
    }

    .status-available { 
      background-color: rgba(0, 210, 106, 0.2) !important; 
      color: #00d26a !important; 
      border: 1px solid #00d26a;
    }
    .status-lent { 
      background-color: rgba(245, 158, 11, 0.2) !important; 
      color: #f59e0b !important; 
      border: 1px solid #f59e0b;
    }
    .status-not_available { 
      background-color: rgba(239, 68, 68, 0.2) !important; 
      color: #ef4444 !important; 
      border: 1px solid #ef4444;
    }

    .book-owner {
      padding: 20px;
      background: #2d3439;
      border: 1px solid #3d4349;
      border-radius: 8px;
    }

    .book-owner h3 {
      margin: 0 0 16px 0;
      color: #ffffff;
      font-weight: 600;
    }

    .owner-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .owner-avatar {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #00d26a;
    }

    .owner-details {
      flex: 1;
    }

    .owner-name {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #ffffff;
    }

    .owner-location {
      margin: 0;
      color: #9ca3af;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .owner-location mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #00d26a;
    }

    .availability-section {
      border-top: 1px solid #2d3439;
      padding-top: 24px;
    }

    .availability-section h3 {
      margin: 0 0 16px 0;
      color: #ffffff;
      font-weight: 600;
    }

    .availability-status {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .status-icon.status-available {
      color: #00d26a;
    }

    .status-icon.status-lent {
      color: #f59e0b;
    }

    .status-icon.status-not_available {
      color: #ef4444;
    }

    .status-text {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #ffffff;
    }

    .status-description {
      margin: 0;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    .book-actions {
      border-top: 1px solid #2d3439;
      padding: 24px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
      background-color: #1e2328;
    }

    .book-actions button[mat-button] {
      color: #9ca3af !important;
    }

    .book-actions button[mat-button]:hover {
      color: #ffffff !important;
    }

    .book-actions button[mat-raised-button] {
      background: #00d26a !important;
      color: #000000 !important;
    }

    .unavailable-message {
      color: #ef4444;
      font-size: 0.875rem;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .book-details-container {
        padding: 16px;
      }

      .book-info {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .book-title {
        font-size: 1.5rem;
      }

      .book-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .book-actions button {
        width: 100%;
      }

      .availability-status {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
  `]
})
export class BookDetailsComponent implements OnInit, OnDestroy {
  book: Book | null = null;
  currentUser: User | null = null;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const bookId = params['id'];
      if (bookId) {
        this.loadBook(bookId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBook(id: string): void {
    this.isLoading = true;
    
    this.bookService.getBook(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (book) => {
          this.book = book;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading book:', error);
          this.book = null;
          this.isLoading = false;
        }
      });
  }

  get isOwner(): boolean {
    return this.currentUser?.id === this.book?.ownerId;
  }

  get canRequest(): boolean {
    return !!(this.currentUser && 
             !this.isOwner && 
             this.book?.status === 'AVAILABLE');
  }

  getStatusIcon(): string {
    switch (this.book?.status) {
      case 'AVAILABLE': return 'check_circle';
      case 'LENT': return 'schedule';
      case 'NOT_AVAILABLE': return 'cancel';
      default: return 'help';
    }
  }

  getStatusText(): string {
    switch (this.book?.status) {
      case 'AVAILABLE': return 'Available for borrowing';
      case 'LENT': return 'Currently lent out';
      case 'NOT_AVAILABLE': return 'Not available';
      default: return 'Unknown status';
    }
  }

  getStatusDescription(): string {
    switch (this.book?.status) {
      case 'AVAILABLE': return 'You can request to borrow this book';
      case 'LENT': return 'This book is currently with another reader';
      case 'NOT_AVAILABLE': return 'The owner has marked this book as unavailable';
      default: return '';
    }
  }

  getUnavailableMessage(): string {
    if (!this.book) return '';
    
    if (this.book.status === 'LENT') {
      return 'This book is currently lent to another reader';
    } else if (this.book.status === 'NOT_AVAILABLE') {
      return 'This book is currently not available for borrowing';
    }
    
    return 'This book cannot be requested at the moment';
  }

  onRequestBook(): void {
    if (!this.book || !this.currentUser) return;

    const dialogRef = this.dialog.open(CreateRequestComponent, {
      width: '500px',
      data: { book: this.book }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Book request sent successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Refresh the book to update status
        if (this.book) {
          this.loadBook(this.book.id);
        }
      }
    });
  }

  goBack(): void {
    window.history.back();
  }
}
