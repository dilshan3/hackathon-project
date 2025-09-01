import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { BookService } from '../../../services/book.service';
import { AuthService } from '../../../services/auth.service';
import { BookCardComponent } from '../book-card/book-card.component';
import { CreateRequestComponent } from '../../requests/create-request/create-request.component';
import { Book } from '../../../models/book.model';
import { Paged } from '../../../models/common.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-book-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    BookCardComponent
  ],
  template: `
    <div class="search-container">
      <mat-card class="search-card">
        <mat-card-header>
          <div class="header-content">
            <mat-card-title>Discover Books</mat-card-title>
            <mat-card-subtitle>Find books to borrow from the ReadLoop community</mat-card-subtitle>
          </div>
          <div class="header-actions" *ngIf="currentUser">
            <button 
              mat-raised-button 
              color="accent"
              routerLink="/recommendations"
              class="recommendations-btn">
              <mat-icon>auto_awesome</mat-icon>
              Get AI Recommendations
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="searchForm" class="search-form">
            <div class="search-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search books</mat-label>
                <input matInput 
                       formControlName="query" 
                       placeholder="Title or author">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>City</mat-label>
                <mat-select formControlName="city">
                  <mat-option value="">All Cities</mat-option>
                  <mat-option *ngFor="let city of cities" [value]="city">
                    {{ city }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="">All Status</mat-option>
                  <mat-option value="AVAILABLE">Available</mat-option>
                  <mat-option value="LENT">Currently Lent</mat-option>
                </mat-select>
              </mat-form-field>

              <button mat-raised-button 
                      color="primary" 
                      type="button"
                      (click)="onSearch()"
                      class="search-button">
                <mat-icon>search</mat-icon>
                Search
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <div class="results-section">
        <div class="results-header" *ngIf="searchResults">
          <h2>
            {{ searchResults.total }} book{{ searchResults.total !== 1 ? 's' : '' }} found
            <span *ngIf="hasActiveFilters()" class="filter-indicator">
              (filtered)
              <button mat-icon-button (click)="clearFilters()" matTooltip="Clear filters">
                <mat-icon>clear</mat-icon>
              </button>
            </span>
          </h2>
        </div>

        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Searching books...</p>
        </div>

        <div *ngIf="!isLoading && searchResults && searchResults.items.length === 0" class="empty-state">
          <mat-icon class="empty-icon">search_off</mat-icon>
          <h3>No books found</h3>
          <p>Try adjusting your search criteria or browse all available books.</p>
          <button mat-raised-button color="primary" (click)="clearFilters()">
            Show All Books
          </button>
        </div>

        <div *ngIf="!isLoading && searchResults && searchResults.items.length > 0" 
             class="books-grid">
          <app-book-card 
            *ngFor="let book of searchResults.items" 
            [book]="book"
            [isOwner]="isBookOwner(book)"
            [showOwner]="true"
            [canRequest]="canRequestBook(book)"
            (request)="onRequestBook($event)">
          </app-book-card>
        </div>

        <mat-paginator 
          *ngIf="searchResults && searchResults.total > searchResults.pageSize"
          [length]="searchResults.total"
          [pageSize]="searchResults.pageSize"
          [pageIndex]="searchResults.page - 1"
          [pageSizeOptions]="[12, 24, 48]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      background-color: var(--bg-primary);
      min-height: calc(100vh - 64px);
    }

    .search-card {
      margin-bottom: 32px;
      background-color: var(--bg-secondary) !important;
      border: 1px solid var(--border-primary);
      color: var(--text-primary);
    }

    .search-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
    }

    .header-content {
      flex: 1;
    }

    .search-card mat-card-header mat-card-title {
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .search-card mat-card-header mat-card-subtitle {
      color: var(--text-secondary);
    }

    .header-actions {
      flex-shrink: 0;
    }

    .recommendations-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: var(--accent-primary) !important;
      color: #000000 !important;
      border-radius: 8px;
    }

    .search-form {
      margin-top: 16px;
    }

    .search-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 16px;
      align-items: end;
    }

    .search-field {
      min-width: 300px;
    }

    .filter-field {
      min-width: 150px;
    }

    .search-button {
      height: 56px;
      min-width: 120px;
      background: var(--accent-primary) !important;
      color: #000000 !important;
    }

    .results-header {
      margin-bottom: 24px;
    }

    .results-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #ffffff;
      font-weight: 600;
    }

    .filter-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #9ca3af;
      font-size: 0.875rem;
      font-weight: normal;
    }

    .filter-indicator button {
      color: #9ca3af;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      color: #9ca3af;
    }

    .loading-container mat-spinner {
      --mdc-circular-progress-active-indicator-color: #00d26a;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      text-align: center;
      color: #9ca3af;
    }

    .empty-state h3 {
      color: #ffffff;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #4b5563;
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    mat-paginator {
      margin-top: 32px;
      background: #1e2328 !important;
      border: 1px solid #2d3439;
      border-radius: 8px;
      color: #ffffff;
    }

    ::ng-deep .mat-mdc-paginator {
      background: #1e2328 !important;
      color: #ffffff;
    }

    ::ng-deep .mat-mdc-paginator .mat-mdc-paginator-range-label {
      color: #ffffff;
    }

    ::ng-deep .mat-mdc-paginator .mat-mdc-icon-button {
      color: #ffffff;
    }

    ::ng-deep .mat-mdc-paginator .mat-mdc-select {
      color: #ffffff;
    }

    @media (max-width: 768px) {
      .search-container {
        padding: 16px;
      }

      .search-card mat-card-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .header-actions {
        align-self: center;
      }

      .recommendations-btn {
        width: 100%;
        justify-content: center;
      }

      .search-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .search-field,
      .filter-field {
        min-width: auto;
      }

      .search-button {
        width: 100%;
        height: 48px;
      }

      .books-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .results-header h2 {
        font-size: 1.25rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class BookSearchComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  searchResults: Paged<Book> | null = null;
  isLoading = false;
  currentUser: User | null = null;
  cities: string[] = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBooks();
    
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Auto-search on form changes with debounce
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.onSearch();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      query: [''],
      city: [''],
      status: ['AVAILABLE'] // Default to available books
    });
  }

  onSearch(): void {
    this.loadBooks();
  }

  private loadBooks(page: number = 1, pageSize: number = 12): void {
    this.isLoading = true;
    
    const formValue = this.searchForm.value;
    
    this.bookService.searchBooks(
      formValue.query || undefined,
      formValue.city || undefined,
      formValue.status || undefined,
      page,
      pageSize
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching books:', error);
        this.snackBar.open('Error loading books. Please try again.', 'Close', {
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

  hasActiveFilters(): boolean {
    const formValue = this.searchForm.value;
    return !!(formValue.query || formValue.city || (formValue.status && formValue.status !== 'AVAILABLE'));
  }

  clearFilters(): void {
    this.searchForm.patchValue({
      query: '',
      city: '',
      status: 'AVAILABLE'
    });
  }

  isBookOwner(book: Book): boolean {
    return this.currentUser?.id === book.ownerId;
  }

  canRequestBook(book: Book): boolean {
    return !!(this.currentUser && 
           !this.isBookOwner(book) && 
           book.status === 'AVAILABLE');
  }

  onRequestBook(book: Book): void {
    if (!this.currentUser) {
      this.snackBar.open('Please log in to request books.', 'Login', {
        duration: 5000
      }).onAction().subscribe(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    const dialogRef = this.dialog.open(CreateRequestComponent, {
      width: '500px',
      data: { book }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Book request sent successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Refresh the book list to update status
        this.loadBooks();
      }
    });
  }
}
