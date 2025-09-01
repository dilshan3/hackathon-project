import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RequestService } from '../../../services/request.service';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Request Book</h2>
    
    <div class="book-info">
      <h3>{{ data.book.title }}</h3>
      <p *ngIf="data.book.author">by {{ data.book.author }}</p>
      <p class="owner-info">
        Owner: {{ data.book.owner?.displayName }}
        <span *ngIf="data.book.owner?.city">({{ data.book.owner?.city }})</span>
      </p>
    </div>

    <form [formGroup]="requestForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-field">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Start Date *</mat-label>
            <input matInput 
                   [matDatepicker]="picker"
                   formControlName="startDate"
                   [min]="minDate"
                   readonly>
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="requestForm.get('startDate')?.hasError('required')">
              Start date is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-field">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Duration (days) *</mat-label>
            <input matInput 
                   type="number"
                   formControlName="durationDays"
                   min="1"
                   max="30"
                   placeholder="Number of days">
            <mat-error *ngIf="requestForm.get('durationDays')?.hasError('required')">
              Duration is required
            </mat-error>
            <mat-error *ngIf="requestForm.get('durationDays')?.hasError('min')">
              Duration must be at least 1 day
            </mat-error>
            <mat-error *ngIf="requestForm.get('durationDays')?.hasError('max')">
              Duration cannot exceed 30 days
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-field">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Note (optional)</mat-label>
            <textarea matInput 
                      formControlName="note"
                      rows="3"
                      maxlength="500"
                      placeholder="Add a message for the book owner"></textarea>
            <mat-hint align="end">
              {{ requestForm.get('note')?.value?.length || 0 }}/500
            </mat-hint>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button type="button" (click)="onCancel()" [disabled]="isLoading">
          Cancel
        </button>
        <button mat-raised-button 
                type="submit" 
                color="primary" 
                [disabled]="requestForm.invalid || isLoading">
          <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
          <span *ngIf="!isLoading">Send Request</span>
          <span *ngIf="isLoading">Sending...</span>
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    :host {
      background-color: #1e2328;
      color: #ffffff;
    }

    h2[mat-dialog-title] {
      color: #ffffff !important;
      font-weight: 600;
      margin-bottom: 0;
    }

    .book-info {
      padding: 16px 0;
      border-bottom: 1px solid #2d3439;
      margin-bottom: 20px;
      background-color: transparent;
    }

    .book-info h3 {
      margin: 0 0 8px 0;
      color: #ffffff;
      font-weight: 600;
    }

    .book-info p {
      margin: 0 0 4px 0;
      color: #9ca3af;
    }

    .owner-info {
      font-weight: 500;
      color: #00d26a;
    }

    .form-field {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      max-height: 400px;
      overflow-y: auto;
      color: #ffffff;
      background-color: transparent;
    }

    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 0;
      background-color: transparent;
      border-top: 1px solid #2d3439;
    }

    mat-dialog-actions button[mat-button] {
      color: #9ca3af !important;
      border-radius: 6px;
    }

    mat-dialog-actions button[mat-button]:hover {
      color: #ffffff !important;
      background-color: rgba(255, 255, 255, 0.1);
    }

    mat-dialog-actions button[mat-raised-button] {
      background: #00d26a !important;
      color: #000000 !important;
      border-radius: 6px;
    }

    mat-dialog-actions button[mat-raised-button]:disabled {
      background: #2d3439 !important;
      color: #6b7280 !important;
    }

    mat-spinner {
      margin-right: 8px;
      --mdc-circular-progress-active-indicator-color: #000000;
    }

    /* Datepicker styling for dark theme */
    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-focus-overlay {
      background-color: rgba(0, 210, 106, 0.12);
    }

    ::ng-deep .mat-datepicker-toggle {
      color: #9ca3af;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-datepicker-toggle {
      color: #00d26a;
    }

    /* Ensure form field labels and hints are visible */
    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-label {
      color: #9ca3af;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-label {
      color: #00d26a !important;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-hint {
      color: #9ca3af;
    }

    /* Input field text */
    ::ng-deep .mat-mdc-input-element {
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-input-element::placeholder {
      color: #6b7280 !important;
    }

    /* Textarea */
    ::ng-deep textarea.mat-mdc-input-element {
      color: #ffffff !important;
    }
  `]
})
export class CreateRequestComponent implements OnInit {
  requestForm!: FormGroup;
  isLoading = false;
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { book: Book }
  ) {}

  ngOnInit(): void {
    this.initForm();
    // Set minimum date to tomorrow
    this.minDate.setDate(this.minDate.getDate() + 1);
  }

  private initForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.requestForm = this.fb.group({
      startDate: [tomorrow, [Validators.required]],
      durationDays: [7, [Validators.required, Validators.min(1), Validators.max(30)]],
      note: ['', [Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.requestForm.valid && !this.isLoading) {
      this.isLoading = true;

      const formValue = this.requestForm.value;
      const requestData = {
        bookId: this.data.book.id,
        startDate: this.formatDate(formValue.startDate),
        durationDays: formValue.durationDays,
        note: formValue.note || undefined
      };

      this.requestService.createRequest(requestData).subscribe({
        next: (request) => {
          this.dialogRef.close(request);
        },
        error: (error) => {
          console.error('Error creating request:', error);
          let errorMessage = 'Failed to send request. Please try again.';
          
          if (error.status === 409) {
            errorMessage = 'This book is no longer available for request.';
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
}
