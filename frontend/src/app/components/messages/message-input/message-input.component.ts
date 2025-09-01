import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TextFieldModule } from '@angular/cdk/text-field';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TextFieldModule
  ],
  template: `
    <div class="message-input-container">
      <form [formGroup]="messageForm" (ngSubmit)="onSend()" class="message-form">
        <mat-form-field appearance="outline" class="message-field">
          <mat-label>Type a message...</mat-label>
          <textarea 
            #messageTextarea
            matInput 
            formControlName="body"
            placeholder="Type your message here..."
            rows="1"
            maxlength="1000"
            (keydown)="onKeyDown($event)"
            cdkTextareaAutosize
            cdkAutosizeMinRows="1"
            cdkAutosizeMaxRows="4">
          </textarea>
          <mat-hint align="end">
            {{ getCharacterCount() }}/1000
          </mat-hint>
          <mat-error *ngIf="messageForm.get('body')?.hasError('required')">
            Message cannot be empty
          </mat-error>
          <mat-error *ngIf="messageForm.get('body')?.hasError('maxlength')">
            Message cannot exceed 1000 characters
          </mat-error>
        </mat-form-field>
        
        <button 
          mat-fab 
          color="primary" 
          type="submit" 
          [disabled]="messageForm.invalid || isSending"
          class="send-button">
          <mat-spinner diameter="24" *ngIf="isSending"></mat-spinner>
          <mat-icon *ngIf="!isSending">send</mat-icon>
        </button>
      </form>
    </div>
  `,
  styles: [`
    .message-input-container {
      padding: 16px;
      background-color: var(--bg-secondary);
      border-top: 1px solid var(--border-primary);
    }

    .message-form {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .message-field {
      flex: 1;
    }

    .send-button {
      width: 48px;
      height: 48px;
      background-color: var(--accent-primary) !important;
      color: #000000 !important;
      margin-bottom: 4px;
    }

    .send-button:disabled {
      background-color: var(--bg-tertiary) !important;
      color: var(--text-disabled) !important;
    }

    .send-button mat-spinner {
      --mdc-circular-progress-active-indicator-color: #000000;
    }

    /* Character counter styling */
    ::ng-deep .mat-mdc-form-field-hint {
      color: var(--text-muted);
    }

    /* Textarea styling */
    ::ng-deep .mat-mdc-input-element {
      color: #ffffff !important;
      resize: none;
    }

    ::ng-deep .mat-mdc-input-element::placeholder {
      color: #6b7280 !important;
    }

    /* Form field styling */
    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-label {
      color: #9ca3af;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-label {
      color: #00d26a !important;
    }

    @media (max-width: 768px) {
      .message-input-container {
        padding: 12px;
      }
      
      .send-button {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class MessageInputComponent {
  @Output() messageSent = new EventEmitter<string>();
  @ViewChild('messageTextarea') messageTextarea!: ElementRef;

  messageForm: FormGroup;
  isSending = false;

  constructor(private fb: FormBuilder) {
    this.messageForm = this.fb.group({
      body: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  onSend(): void {
    if (this.messageForm.valid && !this.isSending) {
      const body = this.messageForm.get('body')?.value?.trim();
      if (body) {
        this.isSending = true;
        this.messageSent.emit(body);
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  getCharacterCount(): number {
    return this.messageForm.get('body')?.value?.length || 0;
  }

  clearInput(): void {
    this.messageForm.reset();
    this.isSending = false;
    this.messageTextarea?.nativeElement?.focus();
  }

  setLoading(loading: boolean): void {
    this.isSending = loading;
  }
}
