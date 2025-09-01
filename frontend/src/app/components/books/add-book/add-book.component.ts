import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookService } from '../../../services/book.service';
import { BookCondition, BookStatus } from '../../../models/book.model';

@Component({
  selector: 'app-add-book',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="add-book-container">
      <mat-card class="add-book-card">
        <mat-card-header>
          <mat-card-title>Add a New Book</mat-card-title>
          <mat-card-subtitle>Share your book with the ReadLoop community</mat-card-subtitle>
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
                </mat-select>
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
          </mat-card-content>

          <mat-card-actions>
            <button mat-button type="button" (click)="onCancel()" [disabled]="isLoading">
              Cancel
            </button>
            <button mat-raised-button 
                    type="submit" 
                    color="primary" 
                    [disabled]="bookForm.invalid || isLoading">
              <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
              <span *ngIf="!isLoading">Add Book</span>
              <span *ngIf="isLoading">Adding...</span>
            </button>
          </mat-card-actions>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .add-book-container {
      display: flex;
      justify-content: center;
      padding: 24px;
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }

    .add-book-card {
      width: 100%;
      max-width: 600px;
      margin-top: 24px;
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

    .condition-descriptions {
      margin-top: 24px;
      padding: 16px;
      background-color: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #4CAF50;
    }

    .condition-descriptions h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 1rem;
    }

    .condition-descriptions ul {
      margin: 0;
      padding-left: 20px;
    }

    .condition-descriptions li {
      margin-bottom: 4px;
      color: #666;
      font-size: 0.875rem;
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
    }

    mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .add-book-container {
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
export class AddBookComponent implements OnInit {
  bookForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      author: ['', [Validators.maxLength(100)]],
      genre: ['', [Validators.maxLength(50)]],
      condition: ['GOOD', [Validators.required]],
      status: ['AVAILABLE', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.bookForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const bookData = this.bookForm.value;
      
      this.bookService.addBook(bookData).subscribe({
        next: (book) => {
          this.snackBar.open('Book added successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/books', book.id]);
        },
        error: (error) => {
          console.error('Error adding book:', error);
          this.snackBar.open(
            'Failed to add book. Please try again.',
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/books/mine']);
  }
}
