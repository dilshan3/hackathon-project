import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, takeUntil } from 'rxjs';
import { RequestService } from '../../../services/request.service';
import { CounterService } from '../../../services/counter.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { BookRequest } from '../../../models/request.model';
import { User } from '../../../models/user.model';
import { MessageThreadComponent } from '../../messages/message-thread/message-thread.component';

@Component({
  selector: 'app-request-details',
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
    MatDividerModule,
    MatTabsModule,
    MessageThreadComponent
  ],
  template: `
    <div class="request-details-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Request Details</h1>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading request details...</p>
      </div>

      <div *ngIf="!isLoading && !request" class="error-state">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3>Request not found</h3>
        <p>The request you're looking for doesn't exist or you don't have permission to view it.</p>
        <button mat-raised-button color="primary" routerLink="/requests">
          Back to Requests
        </button>
      </div>

      <div *ngIf="!isLoading && request" class="request-content">
        <mat-tab-group class="request-tabs" [(selectedIndex)]="selectedTabIndex">
          <mat-tab label="Request Details">
            <ng-template matTabContent>
              <mat-card class="request-card">
                <mat-card-header>
                  <div class="header-content">
                    <div class="book-info">
                      <mat-card-title>{{ request.book?.title }}</mat-card-title>
                      <mat-card-subtitle *ngIf="request.book?.author">
                        by {{ request.book?.author }}
                      </mat-card-subtitle>
                    </div>
                    <mat-chip [class]="'status-' + request.status.toLowerCase()" class="status-chip">
                      {{ request.status }}
                    </mat-chip>
                  </div>
                </mat-card-header>

                <mat-card-content>
                  <div class="request-info">
                    <div class="info-section">
                      <h3>Participants</h3>
                      <div class="participants">
                        <div class="participant">
                          <mat-icon>account_circle</mat-icon>
                          <div class="participant-info">
                            <p class="name">{{ request.owner?.displayName }}</p>
                            <p class="role">Book Owner</p>
                            <p class="location" *ngIf="request.owner?.city">
                              <mat-icon>location_on</mat-icon>
                              {{ request.owner?.city }}
                            </p>
                          </div>
                        </div>

                        <mat-icon class="arrow-icon">arrow_forward</mat-icon>

                        <div class="participant">
                          <mat-icon>account_circle</mat-icon>
                          <div class="participant-info">
                            <p class="name">{{ request.requester?.displayName }}</p>
                            <p class="role">Requester</p>
                            <p class="location" *ngIf="request.requester?.city">
                              <mat-icon>location_on</mat-icon>
                              {{ request.requester?.city }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="info-section">
                      <h3>Request Details</h3>
                      <div class="details-grid">
                        <div class="detail-item" *ngIf="request.startDate">
                          <mat-icon>event</mat-icon>
                          <div>
                            <p class="label">Start Date</p>
                            <p class="value">{{ request.startDate | date:'fullDate' }}</p>
                          </div>
                        </div>

                        <div class="detail-item" *ngIf="request.durationDays">
                          <mat-icon>schedule</mat-icon>
                          <div>
                            <p class="label">Duration</p>
                            <p class="value">{{ request.durationDays }} days</p>
                          </div>
                        </div>

                        <div class="detail-item" *ngIf="request.startDate && request.durationDays">
                          <mat-icon>event_available</mat-icon>
                          <div>
                            <p class="label">Expected Return</p>
                            <p class="value">{{ getExpectedReturnDate() | date:'fullDate' }}</p>
                          </div>
                        </div>

                        <div class="detail-item">
                          <mat-icon>access_time</mat-icon>
                          <div>
                            <p class="label">Request Created</p>
                            <p class="value">{{ request.createdAt | date:'medium' }}</p>
                          </div>
                        </div>

                        <div class="detail-item" *ngIf="request.updatedAt !== request.createdAt">
                          <mat-icon>update</mat-icon>
                          <div>
                            <p class="label">Last Updated</p>
                            <p class="value">{{ request.updatedAt | date:'medium' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <mat-divider *ngIf="request.note"></mat-divider>

                    <div class="info-section" *ngIf="request.note">
                      <h3>Requester's Note</h3>
                      <div class="note-content">
                        <mat-icon>message</mat-icon>
                        <p>"{{ request.note }}"</p>
                      </div>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="info-section">
                      <h3>Status Information</h3>
                      <div class="status-info">
                        <div class="status-icon" [class]="'status-' + request.status.toLowerCase()">
                          <mat-icon>{{ getStatusIcon() }}</mat-icon>
                        </div>
                        <div class="status-text">
                          <p class="status-title">{{ getStatusTitle() }}</p>
                          <p class="status-description">{{ getStatusDescription() }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions class="actions">
                  <button mat-button routerLink="/requests">
                    <mat-icon>list</mat-icon>
                    Back to Requests
                  </button>

                  <button mat-button [routerLink]="['/books', request.bookId]">
                    <mat-icon>auto_stories</mat-icon>
                    View Book
                  </button>

                  <div class="action-buttons">
                    <ng-container *ngIf="isOwner && request.status === 'PENDING'">
                      <button mat-button color="primary" (click)="approveRequest()">
                        <mat-icon>check</mat-icon>
                        Approve Request
                      </button>
                      <button mat-button color="warn" (click)="declineRequest()">
                        <mat-icon>close</mat-icon>
                        Decline Request
                      </button>
                    </ng-container>

                    <ng-container *ngIf="(isOwner || isRequester) && request.status === 'APPROVED'">
                      <button mat-raised-button color="accent" (click)="completeRequest()">
                        <mat-icon>done_all</mat-icon>
                        Mark as Complete
                      </button>
                    </ng-container>
                  </div>
                </mat-card-actions>
              </mat-card>
            </ng-template>
          </mat-tab>

          <mat-tab label="Messages" [disabled]="!canAccessMessages()">
            <ng-template matTabContent>
              <div class="messages-tab-content">
                <app-message-thread [request]="request"></app-message-thread>
              </div>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .request-details-container {
      padding: 24px;
      max-width: 900px;
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

    .error-state h3 {
      color: #ffffff;
    }

    .error-state button {
      background-color: #00d26a !important;
      color: #000000 !important;
    }

    /* Tab styling for dark theme */
    ::ng-deep .request-tabs .mat-mdc-tab-header {
      background-color: #1e2328;
      border-radius: 8px 8px 0 0;
      border: 1px solid #2d3439;
      border-bottom: none;
    }

    ::ng-deep .request-tabs .mat-mdc-tab-label {
      color: #9ca3af !important;
      font-weight: 500;
      min-width: 160px;
      font-size: 1rem;
    }

    ::ng-deep .request-tabs .mat-mdc-tab-label.mdc-tab--active {
      color: #ffffff !important;
    }

    ::ng-deep .request-tabs .mat-mdc-tab-label:hover {
      color: #ffffff !important;
    }

    ::ng-deep .request-tabs .mdc-tab-indicator__content--underline {
      background-color: #00d26a !important;
      height: 3px;
    }

    ::ng-deep .request-tabs .mat-mdc-tab-body-wrapper {
      background-color: #1e2328;
      border: 1px solid #2d3439;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }

    .messages-tab-content {
      padding: 0;
    }

    .request-card {
      background-color: transparent !important;
      box-shadow: none;
      border: none;
    }

    .request-card mat-card-header {
      background-color: transparent;
      padding: 24px 24px 0 24px;
    }

    .request-card mat-card-content {
      background-color: transparent;
      color: #ffffff;
      padding: 0 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
      gap: 16px;
    }

    .book-info {
      flex: 1;
    }

    .book-info mat-card-title {
      color: #ffffff !important;
    }

    .book-info mat-card-subtitle {
      color: #9ca3af !important;
    }

    .status-chip {
      font-weight: 600;
      font-size: 0.875rem;
    }

    .status-pending { 
      background-color: #fbbf24 !important; 
      color: #000000 !important; 
      border: 1px solid #f59e0b;
    }
    .status-approved { 
      background-color: #00d26a !important; 
      color: #000000 !important; 
      border: 1px solid #00a855;
    }
    .status-declined { 
      background-color: #ef4444 !important; 
      color: #ffffff !important; 
      border: 1px solid #dc2626;
    }
    .status-completed { 
      background-color: #3b82f6 !important; 
      color: #ffffff !important; 
      border: 1px solid #2563eb;
    }

    .info-section {
      margin: 24px 0;
    }

    .info-section h3 {
      margin: 0 0 16px 0;
      color: #ffffff;
      font-size: 1.125rem;
    }

    .participants {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .participant {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #16191d;
      border: 1px solid #2d3439;
      border-radius: 8px;
      flex: 1;
      min-width: 200px;
    }

    .participant mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #00d26a;
    }

    .participant-info .name {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #ffffff;
    }

    .participant-info .role {
      margin: 0 0 4px 0;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    .participant-info .location {
      margin: 0;
      color: #6b7280;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .participant-info .location mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .arrow-icon {
      color: #6b7280;
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #16191d;
      border: 1px solid #2d3439;
      border-radius: 8px;
    }

    .detail-item mat-icon {
      color: #00d26a;
      margin-top: 2px;
    }

    .detail-item .label {
      margin: 0 0 4px 0;
      color: #9ca3af;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .detail-item .value {
      margin: 0;
      color: #ffffff;
      font-weight: 600;
    }

    .note-content {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: #16191d;
      border: 1px solid #2d3439;
      border-radius: 8px;
      border-left: 4px solid #00d26a;
    }

    .note-content mat-icon {
      color: #00d26a;
      margin-top: 2px;
    }

    .note-content p {
      margin: 0;
      color: #ffffff;
      font-style: italic;
      flex: 1;
    }

    .status-info {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #16191d;
      border: 1px solid #2d3439;
      border-radius: 8px;
    }

    .status-icon {
      padding: 12px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-icon.status-pending {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }

    .status-icon.status-approved {
      background: rgba(0, 210, 106, 0.2);
      color: #00d26a;
    }

    .status-icon.status-declined {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .status-icon.status-completed {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .status-text .status-title {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #ffffff;
    }

    .status-text .status-description {
      margin: 0;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    .actions {
      border-top: 1px solid #2d3439;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      background-color: transparent;
    }

    .actions button[mat-button] {
      color: #9ca3af !important;
      border-radius: 6px;
    }

    .actions button[mat-button]:hover {
      color: #ffffff !important;
      background-color: rgba(255, 255, 255, 0.1);
    }

    .actions button[color="primary"] {
      color: #00d26a !important;
    }

    .actions button[color="primary"]:hover {
      background-color: rgba(0, 210, 106, 0.1);
    }

    .actions button[color="warn"] {
      color: #ef4444 !important;
    }

    .actions button[color="warn"]:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }

    .actions button[mat-raised-button] {
      background-color: #00d26a !important;
      color: #000000 !important;
      border-radius: 6px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .request-details-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .participants {
        flex-direction: column;
        align-items: stretch;
      }

      .arrow-icon {
        transform: rotate(90deg);
        align-self: center;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column;
        align-items: stretch;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        width: 100%;
      }

      ::ng-deep .request-tabs .mat-mdc-tab-label {
        min-width: 120px;
        font-size: 0.9rem;
      }
    }
  `]
})
export class RequestDetailsComponent implements OnInit, OnDestroy {
  request: BookRequest | null = null;
  currentUser: User | null = null;
  isLoading = false;
  selectedTabIndex = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private counterService: CounterService,
    private authService: AuthService,
    private messageService: MessageService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const requestId = params['id'];
      if (requestId) {
        this.loadRequest(requestId);
      }
    });

    // Check for tab parameter in query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['tab'] === 'messages') {
        this.selectedTabIndex = 1;
      } else {
        this.selectedTabIndex = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRequest(id: string): void {
    this.isLoading = true;
    
    this.requestService.getRequest(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (request) => {
          this.request = request;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading request:', error);
          this.request = null;
          this.isLoading = false;
        }
      });
  }

  get isOwner(): boolean {
    return this.currentUser?.id === this.request?.ownerId;
  }

  get isRequester(): boolean {
    return this.currentUser?.id === this.request?.requesterId;
  }

  canAccessMessages(): boolean {
    return this.isOwner || this.isRequester;
  }

  getExpectedReturnDate(): Date | null {
    if (!this.request?.startDate || !this.request?.durationDays) {
      return null;
    }
    
    const startDate = new Date(this.request.startDate);
    const returnDate = new Date(startDate);
    returnDate.setDate(startDate.getDate() + this.request.durationDays);
    return returnDate;
  }

  getStatusIcon(): string {
    switch (this.request?.status) {
      case 'PENDING': return 'hourglass_empty';
      case 'APPROVED': return 'check_circle';
      case 'DECLINED': return 'cancel';
      case 'COMPLETED': return 'done_all';
      default: return 'help';
    }
  }

  getStatusTitle(): string {
    switch (this.request?.status) {
      case 'PENDING': return 'Pending Review';
      case 'APPROVED': return 'Request Approved';
      case 'DECLINED': return 'Request Declined';
      case 'COMPLETED': return 'Request Completed';
      default: return 'Unknown Status';
    }
  }

  getStatusDescription(): string {
    switch (this.request?.status) {
      case 'PENDING': return 'Waiting for the book owner to approve or decline this request.';
      case 'APPROVED': return 'The request has been approved. The book is ready to be borrowed.';
      case 'DECLINED': return 'The book owner has declined this request.';
      case 'COMPLETED': return 'The book has been returned and the request is complete.';
      default: return '';
    }
  }

  approveRequest(): void {
    if (!this.request) return;

    this.requestService.approveRequest(this.request.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRequest) => {
          this.request = updatedRequest;
          this.snackBar.open('Request approved successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.counterService.refreshCounters();
        },
        error: (error) => {
          console.error('Error approving request:', error);
          let message = 'Failed to approve request. Please try again.';
          if (error.status === 409) {
            message = 'This request has already been processed.';
          }
          this.snackBar.open(message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  declineRequest(): void {
    if (!this.request) return;

    this.requestService.declineRequest(this.request.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRequest) => {
          this.request = updatedRequest;
          this.snackBar.open('Request declined.', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.counterService.refreshCounters();
        },
        error: (error) => {
          console.error('Error declining request:', error);
          let message = 'Failed to decline request. Please try again.';
          if (error.status === 409) {
            message = 'This request has already been processed.';
          }
          this.snackBar.open(message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  completeRequest(): void {
    if (!this.request) return;

    this.requestService.completeRequest(this.request.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRequest) => {
          this.request = updatedRequest;
          this.snackBar.open('Request marked as complete!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.counterService.refreshCounters();
        },
        error: (error) => {
          console.error('Error completing request:', error);
          this.snackBar.open('Failed to complete request. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/requests']);
  }
}
