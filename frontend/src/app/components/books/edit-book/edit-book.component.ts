import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { BookService } from '../../../services/book.service';
import { Book, BookCondition, BookStatus } from '../../../models/book.model';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="edit-book-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Edit Book</h1>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading book details...</p>
      </div>

      <div *ngIf="!isLoading && !book" class="error-state">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3>Book not found</h3>
        <p>The book you're trying to edit doesn't exist or you don't have permission to edit it.</p>
        <button mat-raised-button color="primary" routerLink="/books/mine">
          My Books
        </button>
      </div>

      <mat-card *ngIf="!isLoading && book" class="edit-book-card">
        <mat-card-header>
          <mat-card-title>Edit "{{ book.title }}"</mat-card-title>
          <mat-card-subtitle>Update your book information</mat-card-subtitle>
        </mat-card-header>

        <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Title *</mat-label>
                <input matInput 
                       formControlName="title" 
                       placeholder="Enter book title"
                       maxlength="200">
                <mat-error *ngIf="bookForm.get('title')?.hasError('required')">
                  Title is required
                </mat-error>
                <mat-error *ngIf="bookForm.get('title')?.hasError('maxlength')">
                  Title cannot exceed 200 characters
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Author</mat-label>
                <input matInput 
                       formControlName="author" 
                       placeholder="Enter author name"
                       maxlength="100">
                <mat-error *ngIf="bookForm.get('author')?.hasError('maxlength')">
                  Author name cannot exceed 100 characters
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Genre</mat-label>
                <input matInput 
                       formControlName="genre" 
                       placeholder="e.g. Fiction, Science, Biography"
                       maxlength="50">
                <mat-error *ngIf="bookForm.get('genre')?.hasError('maxlength')">
                  Genre cannot exceed 50 characters
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="outline">
                <mat-label>Condition *</mat-label>
                <mat-select formControlName="condition">
                  <mat-option value="NEW">New</mat-option>
                  <mat-option value="GOOD">Good</mat-option>
                  <mat-option value="FAIR">Fair</mat-option>
                  <mat-option value="POOR">Poor</mat-option>
                </mat-select>
                <mat-error *ngIf="bookForm.get('condition')?.hasError('required')">
                  Condition is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status *</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="AVAILABLE">Available</mat-option>
                  <mat-option value="NOT_AVAILABLE">Not Available</mat-option>
                  <mat-option value="LENT" [disabled]="true">Lent (Cannot be changed manually)</mat-option>
                </mat-select>
                <mat-hint *ngIf="bookForm.get('status')?.value === 'LENT'">
                  Status will change automatically when lending is completed
                </mat-hint>
                <mat-error *ngIf="bookForm.get('status')?.hasError('required')">
                  Status is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="condition-descriptions">
              <h4>Condition Guide:</h4>
              <ul>
                <li><strong>New:</strong> Like new, no visible wear</li>
                <li><strong>Good:</strong> Minor signs of use, all pages intact</li>
                <li><strong>Fair:</strong> Noticeable wear but readable</li>
                <li><strong>Poor:</strong> Heavy wear, may have damage</li>
              </ul>
            </div>

            <div class="status-descriptions">
              <h4>Status Guide:</h4>
              <ul>
                <li><strong>Available:</strong> Ready to be borrowed</li>
                <li><strong>Not Available:</strong> Not available for borrowing</li>
                <li><strong>Lent:</strong> Currently with another reader (managed automatically)</li>
              </ul>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button type="button" (click)="onCancel()" [disabled]="isSaving">
              Cancel
            </button>
            <button mat-raised-button 
                    type="submit" 
                    color="primary" 
                    [disabled]="bookForm.invalid || isSaving || !hasChanges()">
              <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
              <span *ngIf="!isSaving">Save Changes</span>
              <span *ngIf="isSaving">Saving...</span>
            </button>
          </mat-card-actions>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .edit-book-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
      background-color: #0f1419;
      min-height: 100vh;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #ffffff;
    }

    .back-button {
      color: #9ca3af;
    }

    .back-button:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.1);
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

    .error-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #f44336;
    }

    .edit-book-card {
      background-color: #1e2328;
      color: #ffffff;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      border: 1px solid #2d3439;
    }

    .edit-book-card mat-card-header {
      background-color: #1e2328;
    }

    .edit-book-card mat-card-title {
      color: #ffffff !important;
    }

    .edit-book-card mat-card-subtitle {
      color: #9ca3af !important;
    }

    .edit-book-card mat-card-content {
      background-color: #1e2328;
      color: #ffffff;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .condition-descriptions,
    .status-descriptions {
      margin-top: 24px;
      padding: 16px;
      background-color: #16191d;
      border-radius: 8px;
      border-left: 4px solid #00d26a;
      border: 1px solid #2d3439;
    }

    .condition-descriptions h4,
    .status-descriptions h4 {
      margin: 0 0 12px 0;
      color: #ffffff;
      font-size: 1rem;
    }

    .condition-descriptions ul,
    .status-descriptions ul {
      margin: 0;
      padding-left: 20px;
    }

    .condition-descriptions li,
    .status-descriptions li {
      margin-bottom: 4px;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      background-color: #1e2328;
      border-top: 1px solid #2d3439;
    }

    mat-card-actions button {
      border-radius: 6px;
    }

    mat-card-actions button[mat-button] {
      color: #9ca3af;
    }

    mat-card-actions button[mat-button]:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.1);
    }

    mat-card-actions button[mat-raised-button] {
      background-color: #00d26a !important;
      color: #000000 !important;
    }

    mat-card-actions button[mat-raised-button]:disabled {
      background-color: #2d3439 !important;
      color: #6b7280 !important;
    }

    mat-spinner {
      margin-right: 8px;
    }

    mat-spinner circle {
      stroke: #000000;
    }

    @media (max-width: 768px) {
      .edit-book-container {
        padding: 16px;
      }

      .two-columns {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      mat-card-actions {
        flex-direction: column-reverse;
        gap: 8px;
      }

      mat-card-actions button {
        width: 100%;
      }
    }
  `]
})
export class EditBookComponent implements OnInit, OnDestroy {
  bookForm!: FormGroup;
  book: Book | null = null;
  originalBookData: any = null;
  isLoading = false;
  isSaving = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    
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

  private initForm(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      author: ['', [Validators.maxLength(100)]],
      genre: ['', [Validators.maxLength(50)]],
      condition: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });
  }

  private loadBook(id: string): void {
    this.isLoading = true;
    
    this.bookService.getBook(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (book) => {
          this.book = book;
          this.populateForm(book);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading book:', error);
          this.snackBar.open('Book not found or access denied.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.book = null;
          this.isLoading = false;
        }
      });
  }

  private populateForm(book: Book): void {
    this.originalBookData = {
      title: book.title,
      author: book.author || '',
      genre: book.genre || '',
      condition: book.condition,
      status: book.status
    };

    this.bookForm.patchValue(this.originalBookData);
  }

  hasChanges(): boolean {
    if (!this.originalBookData) return false;
    
    const currentData = this.bookForm.value;
    return JSON.stringify(currentData) !== JSON.stringify(this.originalBookData);
  }

  onSubmit(): void {
    if (this.bookForm.valid && !this.isSaving && this.book && this.hasChanges()) {
      this.isSaving = true;
      
      const updates = this.bookForm.value;
      
      this.bookService.updateBook(this.book.id, updates)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedBook) => {
            this.snackBar.open('Book updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/books', updatedBook.id]);
          },
          error: (error) => {
            console.error('Error updating book:', error);
            let errorMessage = 'Failed to update book. Please try again.';
            
            if (error.status === 403) {
              errorMessage = 'You can only edit your own books.';
            } else if (error.status === 404) {
              errorMessage = 'Book not found.';
            }

            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSaving = false;
          }
        });
    }
  }

  onCancel(): void {
    if (this.hasChanges()) {
      const confirmDiscard = confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmDiscard) {
        return;
      }
    }
    
    if (this.book) {
      this.router.navigate(['/books', this.book.id]);
    } else {
      this.router.navigate(['/books/mine']);
    }
  }

  goBack(): void {
    this.onCancel();
  }
}
