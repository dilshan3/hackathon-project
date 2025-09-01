import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, takeUntil, finalize } from 'rxjs';
import { RecommendationService } from '../../../services/recommendation.service';
import { AuthService } from '../../../services/auth.service';
import { RecommendationCardComponent } from '../recommendation-card/recommendation-card.component';
import { PreferencesComponent } from '../preferences/preferences.component';
import { 
  BookRecommendation, 
  RecommendationsResponse, 
  UserPreferences,
  RecommendationFeedback,
  RecommendationRequest 
} from '../../../models/recommendation.model';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTabsModule,
    RecommendationCardComponent
  ],
  template: `
    <div class="recommendations-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <mat-icon>auto_awesome</mat-icon>
            AI Book Recommendations
          </h1>
          <p class="header-subtitle">
            Discover your next favorite book with AI-powered personalized recommendations
          </p>
        </div>
        <div class="header-actions">
          <button 
            mat-raised-button 
            color="primary"
            (click)="openPreferences()"
            [disabled]="isLoading">
            <mat-icon>tune</mat-icon>
            Manage Preferences
          </button>
          <button 
            mat-outlined-button 
            (click)="refreshRecommendations()"
            [disabled]="isLoading || !hasPreferences"
            class="refresh-btn">
            <mat-icon [class.spinning]="isLoading">refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- Onboarding for new users -->
      <mat-card *ngIf="showOnboarding" class="onboarding-card">
        <mat-card-content>
          <div class="onboarding-content">
            <mat-icon class="onboarding-icon">psychology</mat-icon>
            <div class="onboarding-text">
              <h2>Welcome to AI Recommendations!</h2>
              <p>
                Set up your reading preferences to get personalized book recommendations 
                powered by artificial intelligence.
              </p>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="openPreferences()">
                <mat-icon>tune</mat-icon>
                Set Up Preferences
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="isLoading && !recommendations.length" class="loading-state">
        <mat-spinner diameter="50"></mat-spinner>
        <h3>Generating AI Recommendations...</h3>
        <p>Our AI is analyzing your preferences and finding perfect book matches</p>
      </div>

      <!-- Error State -->
      <mat-card *ngIf="hasError && !isLoading" class="error-card">
        <mat-card-content>
          <div class="error-content">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <div class="error-text">
              <h3>Unable to Generate Recommendations</h3>
              <p>{{ errorMessage }}</p>
              <div class="error-actions">
                <button mat-raised-button color="primary" (click)="refreshRecommendations()">
                  <mat-icon>refresh</mat-icon>
                  Try Again
                </button>
                <button mat-button routerLink="/books">
                  Browse All Books
                </button>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Recommendations Grid -->
      <div *ngIf="recommendations.length > 0 && !isLoading" class="recommendations-section">
        <div class="section-header">
          <h2>
            <mat-icon>auto_awesome</mat-icon>
            Recommended for You
          </h2>
          <div class="recommendations-meta">
            <span class="recommendation-count">
              {{ recommendations.length }} of {{ totalAvailable }} recommendations
            </span>
            <span class="generated-time" *ngIf="generatedAt">
              Generated {{ getTimeAgo(generatedAt) }}
            </span>
          </div>
        </div>

        <!-- Current Preferences Summary -->
        <div class="preferences-summary" *ngIf="currentPreferences">
          <h4>Based on your preferences:</h4>
          <div class="preference-tags">
            <span 
              *ngFor="let genre of currentPreferences.genres" 
              class="preference-tag genre-tag">
              {{ genre }}
            </span>
            <span 
              *ngFor="let author of currentPreferences.authors" 
              class="preference-tag author-tag">
              {{ author }}
            </span>
            <span 
              *ngIf="currentPreferences.readingGoals" 
              class="preference-tag goal-tag">
              {{ currentPreferences.readingGoals | titlecase }}
            </span>
            <span 
              *ngIf="currentPreferences.bookLength" 
              class="preference-tag length-tag">
              {{ getLengthLabel(currentPreferences.bookLength) }}
            </span>
          </div>
        </div>

        <!-- Recommendations Grid -->
        <div class="recommendations-grid">
          <app-recommendation-card
            *ngFor="let recommendation of recommendations; trackBy: trackRecommendation"
            [recommendation]="recommendation"
            [userFeedback]="getUserFeedback(recommendation.book.id)"
            (feedbackGiven)="onFeedbackGiven($event)"
            (bookRequested)="onBookRequested($event)">
          </app-recommendation-card>
        </div>

        <!-- Load More Button -->
        <div class="load-more-section" *ngIf="recommendations.length < totalAvailable">
          <button 
            mat-raised-button 
            color="primary"
            (click)="loadMoreRecommendations()"
            [disabled]="isLoadingMore">
            <mat-spinner *ngIf="isLoadingMore" diameter="20"></mat-spinner>
            <span *ngIf="!isLoadingMore">Load More Recommendations</span>
            <span *ngIf="isLoadingMore">Loading...</span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <mat-card *ngIf="!recommendations.length && !isLoading && !hasError && hasPreferences" class="empty-card">
        <mat-card-content>
          <div class="empty-content">
            <mat-icon class="empty-icon">search_off</mat-icon>
            <h3>No Recommendations Found</h3>
            <p>
              We couldn't find any books matching your current preferences. 
              Try adjusting your preferences or explore our book catalog.
            </p>
            <div class="empty-actions">
              <button mat-raised-button color="primary" (click)="openPreferences()">
                <mat-icon>tune</mat-icon>
                Adjust Preferences
              </button>
              <button mat-button routerLink="/books">
                Browse All Books
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .recommendations-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      gap: 24px;
    }

    .header-content h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      color: var(--text-primary);
      font-size: 2rem;
      font-weight: 700;
    }

    .header-subtitle {
      margin: 0;
      color: var(--text-secondary);
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .refresh-btn .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Cards */
    .onboarding-card,
    .error-card,
    .empty-card {
      margin-bottom: 32px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-primary);
    }

    .onboarding-content,
    .error-content,
    .empty-content {
      display: flex;
      align-items: center;
      gap: 24px;
      text-align: left;
    }

    .onboarding-icon,
    .error-icon,
    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      flex-shrink: 0;
    }

    .onboarding-icon {
      color: var(--accent-primary);
    }

    .error-icon {
      color: var(--error);
    }

    .empty-icon {
      color: var(--text-disabled);
    }

    .onboarding-text h2,
    .error-text h3,
    .empty-content h3 {
      margin: 0 0 8px 0;
      color: var(--text-primary);
    }

    .onboarding-text p,
    .error-text p,
    .empty-content p {
      margin: 0 0 16px 0;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .error-actions,
    .empty-actions {
      display: flex;
      gap: 12px;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 64px 24px;
      gap: 16px;
    }

    .loading-state h3 {
      margin: 0;
      color: var(--text-primary);
      font-weight: 600;
    }

    .loading-state p {
      margin: 0;
      color: var(--text-secondary);
    }

    /* Recommendations Section */
    .recommendations-section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
    }

    .section-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .recommendations-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* Preferences Summary */
    .preferences-summary {
      margin-bottom: 24px;
      padding: 16px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: 12px;
    }

    .preferences-summary h4 {
      margin: 0 0 12px 0;
      color: var(--text-primary);
      font-size: 1rem;
      font-weight: 600;
    }

    .preference-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .preference-tag {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .genre-tag {
      background-color: rgba(74, 222, 128, 0.2);
      color: var(--accent-primary);
    }

    .author-tag {
      background-color: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .goal-tag {
      background-color: rgba(139, 69, 19, 0.2);
      color: #8b4513;
    }

    .length-tag {
      background-color: rgba(147, 51, 234, 0.2);
      color: #9333ea;
    }

    /* Recommendations Grid */
    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    /* Load More Section */
    .load-more-section {
      display: flex;
      justify-content: center;
      margin-top: 32px;
    }

    .load-more-section button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .recommendations-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .header-actions {
        flex-direction: column;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .recommendations-meta {
        align-items: flex-start;
      }

      .recommendations-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .onboarding-content,
      .error-content,
      .empty-content {
        flex-direction: column;
        text-align: center;
      }

      .error-actions,
      .empty-actions {
        justify-content: center;
      }
    }
  `]
})
export class RecommendationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  recommendations: BookRecommendation[] = [];
  currentPreferences?: UserPreferences;
  userFeedback: Map<string, RecommendationFeedback> = new Map();
  
  isLoading = false;
  isLoadingMore = false;
  hasError = false;
  errorMessage = '';
  hasPreferences = false;
  showOnboarding = false;
  
  totalAvailable = 0;
  generatedAt?: string;
  currentPage = 1;
  readonly pageSize = 10;

  constructor(
    private recommendationService: RecommendationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.checkUserPreferences();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkUserPreferences(): void {
    this.recommendationService.getUserPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preferences) => {
          this.currentPreferences = preferences || undefined;
          this.hasPreferences = this.recommendationService.hasPreferences();
          
          if (this.hasPreferences) {
            this.loadRecommendations();
          } else {
            this.showOnboarding = true;
          }
        },
        error: (error) => {
          console.error('Error loading preferences:', error);
          this.showOnboarding = true;
        }
      });
  }

  private loadRecommendations(): void {
    if (!this.currentPreferences || !this.hasPreferences) {
      return;
    }

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    // Get current user for city information
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (!user) return;

        const request: RecommendationRequest = {
          userId: user.id,
          city: user.city || '',
          preferences: this.currentPreferences,
          maxResults: this.pageSize,
          excludeBookIds: this.recommendations.map(r => r.book.id)
        };

        this.recommendationService.getRecommendations(request)
          .pipe(
            finalize(() => {
              this.isLoading = false;
              this.isLoadingMore = false;
            }),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (response) => {
              this.handleRecommendationsResponse(response);
            },
            error: (error) => {
              this.handleRecommendationsError(error);
            }
          });
      });
  }

  private handleRecommendationsResponse(response: RecommendationsResponse): void {
    if (this.currentPage === 1) {
      this.recommendations = response.recommendations;
    } else {
      this.recommendations = [...this.recommendations, ...response.recommendations];
    }
    
    this.totalAvailable = response.totalAvailable;
    this.generatedAt = response.generatedAt;
    this.currentPreferences = response.preferences as UserPreferences;
    this.hasError = false;
    this.showOnboarding = false;
  }

  private handleRecommendationsError(error: any): void {
    console.error('Error loading recommendations:', error);
    this.hasError = true;
    
    if (error.status === 404) {
      this.errorMessage = 'No books found matching your preferences. Try adjusting your criteria.';
    } else if (error.status === 429) {
      this.errorMessage = 'Too many requests. Please wait a moment before trying again.';
    } else {
      this.errorMessage = 'Unable to load recommendations. Please check your connection and try again.';
    }
  }

  refreshRecommendations(): void {
    this.currentPage = 1;
    this.recommendations = [];
    this.loadRecommendations();
  }

  loadMoreRecommendations(): void {
    if (this.isLoadingMore || this.recommendations.length >= this.totalAvailable) {
      return;
    }
    
    this.currentPage++;
    this.isLoadingMore = true;
    this.loadRecommendations();
  }

  openPreferences(): void {
    const dialogRef = this.dialog.open(PreferencesComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'preferences-dialog',
      disableClose: false,
      autoFocus: false
    });

    dialogRef.componentInstance.preferencesChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((preferences) => {
        this.currentPreferences = preferences;
        this.hasPreferences = true;
        this.showOnboarding = false;
        this.refreshRecommendations();
        dialogRef.close();
      });
  }

  onFeedbackGiven(feedback: RecommendationFeedback): void {
    this.userFeedback.set(feedback.bookId, feedback);
    
    this.recommendationService.submitFeedback(feedback)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const message = feedback.liked ? 
            'Thank you for the feedback! This will improve your recommendations.' :
            'Noted. We\'ll try to recommend different types of books.';
          
          this.snackBar.open(message, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error submitting feedback:', error);
        }
      });
  }

  onBookRequested(recommendation: BookRecommendation): void {
    this.snackBar.open(
      `Request sent for "${recommendation.book.title}"!`, 
      'Close', 
      {
        duration: 3000,
        panelClass: ['success-snackbar']
      }
    );
  }

  getUserFeedback(bookId: string): RecommendationFeedback | undefined {
    return this.userFeedback.get(bookId);
  }

  trackRecommendation(index: number, recommendation: BookRecommendation): string {
    return recommendation.book.id;
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  getLengthLabel(length: string): string {
    switch (length) {
      case 'short': return 'Short Books';
      case 'medium': return 'Medium Length';
      case 'long': return 'Long Books';
      default: return length;
    }
  }
}
