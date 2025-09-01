import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { RequestService } from '../../../services/request.service';
import { CounterService } from '../../../services/counter.service';
import { BookRequest, RequestStatus } from '../../../models/request.model';
import { Paged } from '../../../models/common.model';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="requests-container">
      <div class="header">
        <h1>Book Requests</h1>
        <p class="subtitle">Manage your book lending and borrowing requests</p>
      </div>

      <mat-tab-group [(selectedIndex)]="selectedTabIndex" (selectedTabChange)="onTabChange($event)">
        <mat-tab label="As Owner">
          <ng-template matTabContent>
            <div class="tab-content">
              <div class="filters">
                <form [formGroup]="ownerFiltersForm">
                  <mat-form-field appearance="outline">
                    <mat-label>Filter by Status</mat-label>
                    <mat-select formControlName="status">
                      <mat-option value="">All Requests</mat-option>
                      <mat-option value="PENDING">Pending</mat-option>
                      <mat-option value="APPROVED">Approved</mat-option>
                      <mat-option value="DECLINED">Declined</mat-option>
                      <mat-option value="COMPLETED">Completed</mat-option>
                    </mat-select>
                  </mat-form-field>
                </form>
              </div>

              <div *ngIf="isLoadingOwner" class="loading-container">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Loading requests...</p>
              </div>

              <div *ngIf="!isLoadingOwner && (!ownerRequests || ownerRequests.items.length === 0)" 
                   class="empty-state">
                <mat-icon class="empty-icon">inbox</mat-icon>
                <h3>No requests found</h3>
                <p>You haven't received any book requests yet.</p>
              </div>

              <div *ngIf="!isLoadingOwner && ownerRequests && ownerRequests.items.length > 0">
                <div class="requests-stats">
                  {{ ownerRequests.total }} request{{ ownerRequests.total !== 1 ? 's' : '' }} total
                </div>

                <div class="requests-list">
                  <mat-card *ngFor="let request of ownerRequests.items" class="request-card">
                    <mat-card-content>
                      <div class="request-header">
                        <div class="book-info">
                          <h3>{{ request.book?.title }}</h3>
                          <p class="requester-info">
                            Requested by <strong>{{ request.requester?.displayName }}</strong>
                            <span *ngIf="request.requester?.city">({{ request.requester?.city }})</span>
                          </p>
                        </div>
                        <mat-chip [class]="'status-' + request.status.toLowerCase()">
                          {{ request.status }}
                        </mat-chip>
                      </div>

                      <div class="request-details">
                        <div class="detail-item" *ngIf="request.startDate">
                          <mat-icon>event</mat-icon>
                          <span>Start: {{ request.startDate | date:'mediumDate' }}</span>
                        </div>
                        <div class="detail-item" *ngIf="request.durationDays">
                          <mat-icon>schedule</mat-icon>
                          <span>Duration: {{ request.durationDays }} days</span>
                        </div>
                        <div class="detail-item">
                          <mat-icon>access_time</mat-icon>
                          <span>Requested: {{ request.createdAt | date:'short' }}</span>
                        </div>
                      </div>

                      <div class="request-note" *ngIf="request.note">
                        <mat-icon>message</mat-icon>
                        <p>"{{ request.note }}"</p>
                      </div>
                    </mat-card-content>

                    <mat-card-actions>
                      <button mat-button [routerLink]="['/requests', request.id]">
                        <mat-icon>visibility</mat-icon>
                        View Details
                      </button>

                      <ng-container *ngIf="request.status === 'PENDING'">
                        <button mat-button color="primary" (click)="approveRequest(request)">
                          <mat-icon>check</mat-icon>
                          Approve
                        </button>
                        <button mat-button color="warn" (click)="declineRequest(request)">
                          <mat-icon>close</mat-icon>
                          Decline
                        </button>
                      </ng-container>

                      <ng-container *ngIf="request.status === 'APPROVED'">
                        <button mat-raised-button color="accent" (click)="completeRequest(request)">
                          <mat-icon>done_all</mat-icon>
                          Mark Complete
                        </button>
                      </ng-container>
                    </mat-card-actions>
                  </mat-card>
                </div>

                <mat-paginator 
                  *ngIf="ownerRequests.total > ownerRequests.pageSize"
                  [length]="ownerRequests.total"
                  [pageSize]="ownerRequests.pageSize"
                  [pageIndex]="ownerRequests.page - 1"
                  [pageSizeOptions]="[10, 20, 50]"
                  (page)="onOwnerPageChange($event)"
                  showFirstLastButtons>
                </mat-paginator>
              </div>
            </div>
          </ng-template>
        </mat-tab>

        <mat-tab label="As Requester">
          <ng-template matTabContent>
            <div class="tab-content">
              <div class="filters">
                <form [formGroup]="requesterFiltersForm">
                  <mat-form-field appearance="outline">
                    <mat-label>Filter by Status</mat-label>
                    <mat-select formControlName="status">
                      <mat-option value="">All Requests</mat-option>
                      <mat-option value="PENDING">Pending</mat-option>
                      <mat-option value="APPROVED">Approved</mat-option>
                      <mat-option value="DECLINED">Declined</mat-option>
                      <mat-option value="COMPLETED">Completed</mat-option>
                    </mat-select>
                  </mat-form-field>
                </form>
              </div>

              <div *ngIf="isLoadingRequester" class="loading-container">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Loading requests...</p>
              </div>

              <div *ngIf="!isLoadingRequester && (!requesterRequests || requesterRequests.items.length === 0)" 
                   class="empty-state">
                <mat-icon class="empty-icon">send</mat-icon>
                <h3>No requests found</h3>
                <p>You haven't made any book requests yet.</p>
                <button mat-raised-button color="primary" routerLink="/books">
                  <mat-icon>search</mat-icon>
                  Browse Books
                </button>
              </div>

              <div *ngIf="!isLoadingRequester && requesterRequests && requesterRequests.items.length > 0">
                <div class="requests-stats">
                  {{ requesterRequests.total }} request{{ requesterRequests.total !== 1 ? 's' : '' }} total
                </div>

                <div class="requests-list">
                  <mat-card *ngFor="let request of requesterRequests.items" class="request-card">
                    <mat-card-content>
                      <div class="request-header">
                        <div class="book-info">
                          <h3>{{ request.book?.title }}</h3>
                          <p class="owner-info">
                            Owned by <strong>{{ request.owner?.displayName }}</strong>
                            <span *ngIf="request.owner?.city">({{ request.owner?.city }})</span>
                          </p>
                        </div>
                        <mat-chip [class]="'status-' + request.status.toLowerCase()">
                          {{ request.status }}
                        </mat-chip>
                      </div>

                      <div class="request-details">
                        <div class="detail-item" *ngIf="request.startDate">
                          <mat-icon>event</mat-icon>
                          <span>Start: {{ request.startDate | date:'mediumDate' }}</span>
                        </div>
                        <div class="detail-item" *ngIf="request.durationDays">
                          <mat-icon>schedule</mat-icon>
                          <span>Duration: {{ request.durationDays }} days</span>
                        </div>
                        <div class="detail-item">
                          <mat-icon>access_time</mat-icon>
                          <span>Requested: {{ request.createdAt | date:'short' }}</span>
                        </div>
                      </div>

                      <div class="request-note" *ngIf="request.note">
                        <mat-icon>message</mat-icon>
                        <p>"{{ request.note }}"</p>
                      </div>
                    </mat-card-content>

                    <mat-card-actions>
                      <button mat-button [routerLink]="['/requests', request.id]">
                        <mat-icon>visibility</mat-icon>
                        View Details
                      </button>

                      <ng-container *ngIf="request.status === 'APPROVED'">
                        <button mat-raised-button color="accent" (click)="completeRequest(request)">
                          <mat-icon>done_all</mat-icon>
                          Mark Complete
                        </button>
                      </ng-container>
                    </mat-card-actions>
                  </mat-card>
                </div>

                <mat-paginator 
                  *ngIf="requesterRequests.total > requesterRequests.pageSize"
                  [length]="requesterRequests.total"
                  [pageSize]="requesterRequests.pageSize"
                  [pageIndex]="requesterRequests.page - 1"
                  [pageSizeOptions]="[10, 20, 50]"
                  (page)="onRequesterPageChange($event)"
                  showFirstLastButtons>
                </mat-paginator>
              </div>
            </div>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .requests-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 32px;
    }

    .header h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 2rem;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    .tab-content {
      padding: 24px 0;
    }

    .filters {
      margin-bottom: 24px;
    }

    .filters form {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .loading-container,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      text-align: center;
      color: #666;
    }

    .empty-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #ccc;
    }

    .empty-state h3 {
      margin: 0;
      color: #333;
    }

    .requests-stats {
      margin-bottom: 16px;
      color: #666;
      font-weight: 500;
    }

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .request-card {
      transition: transform 0.2s ease-in-out;
    }

    .request-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.12);
    }

    .request-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      gap: 16px;
    }

    .book-info h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.25rem;
    }

    .requester-info,
    .owner-info {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }

    .request-details {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
      font-size: 0.875rem;
    }

    .detail-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #999;
    }

    .request-note {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #4CAF50;
    }

    .request-note mat-icon {
      color: #4CAF50;
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
      margin-top: 2px;
    }

    .request-note p {
      margin: 0;
      color: #333;
      font-style: italic;
      flex: 1;
    }

    .status-pending { 
      background-color: #fff3e0 !important; 
      color: #f57c00 !important; 
    }
    .status-approved { 
      background-color: #e8f5e8 !important; 
      color: #2e7d32 !important; 
    }
    .status-declined { 
      background-color: #ffebee !important; 
      color: #d32f2f !important; 
    }
    .status-completed { 
      background-color: #e3f2fd !important; 
      color: #1976d2 !important; 
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      border-top: 1px solid #e0e0e0;
      padding: 16px 24px;
    }

    mat-card-actions button mat-icon {
      margin-right: 4px;
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    mat-paginator {
      margin-top: 24px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    @media (max-width: 768px) {
      .requests-container {
        padding: 16px;
      }

      .header h1 {
        font-size: 1.5rem;
      }

      .request-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .request-details {
        flex-direction: column;
        gap: 8px;
      }

      mat-card-actions {
        flex-direction: column;
      }

      mat-card-actions button {
        width: 100%;
      }
    }
  `]
})
export class RequestsComponent implements OnInit, OnDestroy {
  ownerRequests: Paged<BookRequest> | null = null;
  requesterRequests: Paged<BookRequest> | null = null;
  isLoadingOwner = false;
  isLoadingRequester = false;
  selectedTabIndex = 0;
  
  ownerFiltersForm!: FormGroup;
  requesterFiltersForm!: FormGroup;
  
  private destroy$ = new Subject<void>();

  constructor(
    private requestService: RequestService,
    private counterService: CounterService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.setupFormSubscriptions();
    
    // Check for tab parameter in query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['tab'] === 'requester') {
        this.selectedTabIndex = 1;
      } else if (params['tab'] === 'owner') {
        this.selectedTabIndex = 0;
      }
    });

    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.ownerFiltersForm = this.fb.group({
      status: ['']
    });

    this.requesterFiltersForm = this.fb.group({
      status: ['']
    });
  }

  private setupFormSubscriptions(): void {
    this.ownerFiltersForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.loadOwnerRequests();
      });

    this.requesterFiltersForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.loadRequesterRequests();
      });
  }

  private loadInitialData(): void {
    this.loadOwnerRequests();
    this.loadRequesterRequests();
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  private loadOwnerRequests(page: number = 1, pageSize: number = 10): void {
    this.isLoadingOwner = true;
    const status = this.ownerFiltersForm.get('status')?.value || undefined;

    this.requestService.getRequests('owner', status, page, pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests) => {
          this.ownerRequests = requests;
          this.isLoadingOwner = false;
        },
        error: (error) => {
          console.error('Error loading owner requests:', error);
          this.snackBar.open('Error loading requests. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoadingOwner = false;
        }
      });
  }

  private loadRequesterRequests(page: number = 1, pageSize: number = 10): void {
    this.isLoadingRequester = true;
    const status = this.requesterFiltersForm.get('status')?.value || undefined;

    this.requestService.getRequests('requester', status, page, pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests) => {
          this.requesterRequests = requests;
          this.isLoadingRequester = false;
        },
        error: (error) => {
          console.error('Error loading requester requests:', error);
          this.snackBar.open('Error loading requests. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoadingRequester = false;
        }
      });
  }

  onOwnerPageChange(event: PageEvent): void {
    this.loadOwnerRequests(event.pageIndex + 1, event.pageSize);
  }

  onRequesterPageChange(event: PageEvent): void {
    this.loadRequesterRequests(event.pageIndex + 1, event.pageSize);
  }

  approveRequest(request: BookRequest): void {
    this.requestService.approveRequest(request.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Request approved successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadOwnerRequests();
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

  declineRequest(request: BookRequest): void {
    this.requestService.declineRequest(request.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Request declined.', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadOwnerRequests();
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

  completeRequest(request: BookRequest): void {
    this.requestService.completeRequest(request.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Request marked as complete!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadOwnerRequests();
          this.loadRequesterRequests();
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
}
