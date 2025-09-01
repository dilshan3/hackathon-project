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
import { MatIconModule } from '@angular/material/icon';
import { RequestService } from '../../../services/request.service';
import { WebhookService } from '../../../services/webhook.service';
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
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon">
            <mat-icon>book</mat-icon>
          </div>
          <h2>Request Book</h2>
        </div>
        <button mat-icon-button class="close-btn" (click)="onCancel()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Book Info -->
      <div class="book-info">
        <div class="book-cover">
          <mat-icon>auto_stories</mat-icon>
        </div>
        <div class="book-details">
          <h3>{{ data.book.title }}</h3>
          <p *ngIf="data.book.author">by {{ data.book.author }}</p>
          <div class="owner">
            <mat-icon>person</mat-icon>
            <span>{{ data.book.owner?.displayName }}</span>
            <span *ngIf="data.book.owner?.city">• {{ data.book.owner?.city }}</span>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="requestForm" (ngSubmit)="onSubmit()" class="request-form">
        <div class="form-title">
          <h3>Request Details</h3>
          <p>Fill in the details below to request this book</p>
        </div>

        <div class="form-content">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Start Date *</mat-label>
              <input matInput 
                     [matDatepicker]="picker"
                     formControlName="startDate"
                     [min]="minDate"
                     readonly
                     placeholder="Select start date">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="requestForm.get('startDate')?.hasError('required')">
                Start date is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Duration (days) *</mat-label>
              <input matInput 
                     type="number"
                     formControlName="durationDays"
                     min="1"
                     max="30"
                     placeholder="1-30 days">
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

          <mat-form-field appearance="outline" class="message-field">
            <mat-label>Message to Owner (optional)</mat-label>
            <textarea matInput 
                      formControlName="note"
                      rows="4"
                      maxlength="500"
                      placeholder="Introduce yourself and explain why you'd like to borrow this book..."></textarea>
            <mat-hint align="start">Share a bit about yourself and your reading interests</mat-hint>
            <mat-hint align="end">{{ requestForm.get('note')?.value?.length || 0 }}/500</mat-hint>
          </mat-form-field>
        </div>

        <!-- Buttons -->
        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()" [disabled]="isLoading">
            <mat-icon>cancel</mat-icon>
            Cancel
          </button>
          <button mat-raised-button 
                  type="submit" 
                  color="primary" 
                  [disabled]="requestForm.invalid || isLoading">
            <mat-spinner *ngIf="isLoading" diameter="18"></mat-spinner>
            <mat-icon *ngIf="!isLoading">send</mat-icon>
            <span *ngIf="!isLoading">Send Request</span>
            <span *ngIf="isLoading">Sending...</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #1e2328;
      color: #ffffff;
    }

    .modal-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-height: 90vh;
      overflow-y: auto;
    }

    /* Header */
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 2px solid #2d3439;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #00d26a, #00b894);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }

    .header-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #ffffff;
    }

    .close-btn {
      color: #9ca3af;
      margin: -8px;
    }

    .close-btn:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Book Info */
    .book-info {
      display: flex;
      gap: 20px;
      padding: 20px;
      background: linear-gradient(135deg, #2d3439, #3d4449);
      border-radius: 16px;
      border: 1px solid #4a5568;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .book-cover {
      width: 80px;
      height: 100px;
      background: linear-gradient(135deg, #00d26a, #00b894);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 16px rgba(0, 210, 106, 0.3);
    }

    .book-cover mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #ffffff;
    }

    .book-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .book-details h3 {
      margin: 0 0 8px 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
    }

    .book-details p {
      margin: 0 0 12px 0;
      color: #9ca3af;
      font-size: 1rem;
    }

    .owner {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #00d26a;
      font-weight: 600;
    }

    .owner mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .owner span:last-child {
      color: #9ca3af;
      font-weight: 400;
    }

    /* Form */
    .request-form {
      background-color: #2d3439;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #4a5568;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-title {
      text-align: center;
    }

    .form-title h3 {
      margin: 0 0 8px 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
    }

    .form-title p {
      margin: 0;
      color: #9ca3af;
      font-size: 1rem;
    }

    .form-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .message-field {
      width: 100%;
    }

    /* Form Fields */
    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-label {
      color: #9ca3af !important;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-label {
      color: #00d26a !important;
    }

    ::ng-deep .mat-mdc-input-element {
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-form-field-outline {
      color: #4a5568 !important;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-outline {
      color: #00d26a !important;
    }

    ::ng-deep .mat-datepicker-toggle {
      color: #9ca3af !important;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-datepicker-toggle {
      color: #00d26a !important;
    }

    ::ng-deep .mat-mdc-form-field-hint {
      color: #9ca3af !important;
    }

    /* Buttons */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid #4a5568;
    }

    .form-actions button[mat-button] {
      color: #9ca3af;
      border-radius: 8px;
      padding: 8px 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-actions button[mat-button]:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.1);
    }

    .form-actions button[mat-raised-button] {
      background: #00d26a !important;
      color: #000000 !important;
      border-radius: 8px;
      padding: 8px 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }

    .form-actions button[mat-raised-button]:disabled {
      background: #2d3439 !important;
      color: #6b7280 !important;
    }

    mat-spinner {
      margin-right: 8px;
      --mdc-circular-progress-active-indicator-color: #000000;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .modal-container {
        padding: 16px;
        max-height: 95vh;
      }

      .book-info {
        flex-direction: column;
        text-align: center;
        padding: 16px;
      }

      .book-cover {
        align-self: center;
        width: 70px;
        height: 90px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .form-actions {
        flex-direction: column-reverse;
        gap: 12px;
      }

      .form-actions button {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .modal-container {
        padding: 12px;
        max-height: 98vh;
      }

      .request-form {
        padding: 20px;
      }

      .book-info {
        padding: 16px;
      }

      h2 {
        font-size: 1.5rem;
      }

      .book-details h3 {
        font-size: 1.25rem;
      }
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
    private webhookService: WebhookService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { book: Book }
  ) {}

  ngOnInit(): void {
    this.initForm();
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
          // Send webhook notification
          this.sendWebhookNotification(request, formValue);
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

  private sendWebhookNotification(request: any, formValue: any): void {
    // Send webhook notification about the new book request
    const webhookData = {
      bookId: this.data.book.id,
      bookTitle: this.data.book.title,
      requesterId: request.requesterId || 'current-user', // You might need to get this from auth service
      requesterName: 'Current User', // You might need to get this from auth service
      ownerId: this.data.book.ownerId,
      ownerName: this.data.book.owner?.displayName || 'Book Owner',
      startDate: formValue.startDate.toISOString().split('T')[0],
      durationDays: formValue.durationDays
    };

    this.webhookService.sendBookRequestEvent(webhookData).subscribe({
      next: (response) => {
        console.log('Webhook notification sent successfully:', response);
      },
      error: (error) => {
        console.error('Failed to send webhook notification:', error);
        // Don't show error to user as webhook is optional
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
