import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { BookService } from '../../../services/book.service';
import { BookCardComponent } from '../book-card/book-card.component';
import { Book } from '../../../models/book.model';
import { Paged } from '../../../models/common.model';

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    BookCardComponent
  ],
  template: `
    <div class="my-books-container">
      <div class="header">
        <div class="title-section">
          <h1>My Books</h1>
          <p class="subtitle">Manage your book collection</p>
        </div>
        <button mat-raised-button 
                color="primary" 
                routerLink="/books/add"
                class="add-button">
          <mat-icon>add</mat-icon>
          Add New Book
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading your books...</p>
      </div>

      <div *ngIf="!isLoading && (!books || books.items.length === 0)" class="empty-state">
        <mat-icon class="empty-icon">auto_stories</mat-icon>
        <h3>No books yet</h3>
        <p>Start building your collection by adding your first book!</p>
        <button mat-raised-button 
                color="primary" 
                routerLink="/books/add"
                class="add-first-book">
          <mat-icon>add</mat-icon>
          Add Your First Book
        </button>
      </div>

      <div *ngIf="!isLoading && books && books.items.length > 0" class="books-section">
        <div class="books-stats">
          <span class="total-count">
            {{ books.total }} book{{ books.total !== 1 ? 's' : '' }} total
          </span>
          <span class="status-breakdown">
            Available: {{ getAvailableCount() }} | 
            Lent: {{ getLentCount() }} | 
            Not Available: {{ getNotAvailableCount() }}
          </span>
        </div>

        <div class="books-grid">
          <app-book-card 
            *ngFor="let book of books.items" 
            [book]="book"
            [isOwner]="true"
            [showOwner]="false"
            [canRequest]="false"
            (delete)="onDeleteBook($event)">
          </app-book-card>
        </div>

        <mat-paginator 
          *ngIf="books.total > books.pageSize"
          [length]="books.total"
          [pageSize]="books.pageSize"
          [pageIndex]="books.page - 1"
          [pageSizeOptions]="[12, 24, 48]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .my-books-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      gap: 16px;
    }

    .title-section h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 2rem;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    .add-button {
      min-width: 160px;
      height: 48px;
    }

    .add-button mat-icon {
      margin-right: 8px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 64px;
      color: #666;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 64px;
      text-align: center;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
    }

    .empty-state h3 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }

    .empty-state p {
      margin: 0;
      max-width: 400px;
    }

    .add-first-book {
      margin-top: 8px;
    }

    .add-first-book mat-icon {
      margin-right: 8px;
    }

    .books-section {
      margin-bottom: 32px;
    }

    .books-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .total-count {
      font-weight: 600;
      color: #333;
      font-size: 1.1rem;
    }

    .status-breakdown {
      color: #666;
      font-size: 0.9rem;
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    mat-paginator {
      margin-top: 32px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    @media (max-width: 768px) {
      .my-books-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: stretch;
      }

      .add-button {
        width: 100%;
      }

      .books-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .books-stats {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .title-section h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class MyBooksComponent implements OnInit, OnDestroy {
  books: Paged<Book> | null = null;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private bookService: BookService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBooks(page: number = 1, pageSize: number = 12): void {
    this.isLoading = true;
    
    this.bookService.getMyBooks(page, pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (books) => {
          this.books = books;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading books:', error);
          this.snackBar.open('Error loading your books. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.loadBooks(event.pageIndex + 1, event.pageSize);
  }

  onDeleteBook(book: Book): void {
    const confirmDialog = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { book }
    });

    confirmDialog.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.bookService.deleteBook(book.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Book deleted successfully!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.loadBooks(); // Refresh the list
            },
            error: (error) => {
              console.error('Error deleting book:', error);
              this.snackBar.open('Error deleting book. Please try again.', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  getAvailableCount(): number {
    return this.books?.items.filter(book => book.status === 'AVAILABLE').length || 0;
  }

  getLentCount(): number {
    return this.books?.items.filter(book => book.status === 'LENT').length || 0;
  }

  getNotAvailableCount(): number {
    return this.books?.items.filter(book => book.status === 'NOT_AVAILABLE').length || 0;
  }
}

// Separate component for delete confirmation dialog
@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">warning</mat-icon>
      Delete Book
    </h2>
    
    <mat-dialog-content>
      <p>Are you sure you want to delete <strong>"{{ data.book.title }}"</strong>?</p>
      <p class="warning-text">This action cannot be undone.</p>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .warning-text {
      color: #f44336;
      font-size: 0.875rem;
    }

    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class ConfirmDeleteDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { book: Book }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
