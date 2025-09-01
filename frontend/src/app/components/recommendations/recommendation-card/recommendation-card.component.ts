import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BookRecommendation, RecommendationFeedback } from '../../../models/recommendation.model';
import { CreateRequestComponent } from '../../requests/create-request/create-request.component';
import { BookDetailsComponent } from '../../books/book-details/book-details.component';

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <mat-card class="recommendation-card" [class.expanded]="showReasoning">
      <!-- Book Cover & Basic Info -->
      <div class="card-header" (click)="openBookDetails()">
        <div class="book-cover">
          <img 
            [src]="getBookCoverUrl()"
            [alt]="recommendation.book.title"
            loading="lazy">
        </div>
        <div class="book-info">
          <h3 class="book-title">{{ recommendation.book.title }}</h3>
          <p class="book-author" *ngIf="recommendation.book.author">
            by {{ recommendation.book.author }}
          </p>
          <div class="owner-info">
            <span class="owner-name">{{ recommendation.book.owner?.displayName }}</span>
            <span class="owner-location" *ngIf="recommendation.book.owner?.city">
              • {{ recommendation.book.owner?.city }}
            </span>
          </div>
          <div class="book-condition">
            <mat-chip class="condition-chip" [class]="'condition-' + recommendation.book.condition">
              {{ recommendation.book.condition | titlecase }}
            </mat-chip>
          </div>
        </div>
      </div>

      <!-- AI Score & Match Factors -->
      <div class="recommendation-score">
        <div class="score-container">
          <div class="score-value">
            <span class="score-number">{{ getScorePercentage() }}%</span>
            <div class="score-stars">
              <mat-icon 
                *ngFor="let star of getStarArray()" 
                [class.filled]="star <= getStarRating()">
                {{ star <= getStarRating() ? 'star' : 'star_border' }}
              </mat-icon>
            </div>
          </div>
          <div class="match-factors">
            <mat-chip 
              *ngFor="let factor of recommendation.matchFactors" 
              class="match-chip">
              {{ factor }}
            </mat-chip>
          </div>
        </div>
      </div>

      <!-- AI Reasoning (Expandable) -->
      <div class="reasoning-section">
        <button 
          mat-button 
          class="reasoning-toggle"
          (click)="toggleReasoning()"
          [attr.aria-expanded]="showReasoning">
          <mat-icon>{{ showReasoning ? 'expand_less' : 'expand_more' }}</mat-icon>
          Why this book?
        </button>
        
        <div class="reasoning-content" *ngIf="showReasoning" [@expandCollapse]>
          <div class="ai-bubble">
            <mat-icon class="ai-icon">psychology</mat-icon>
            <p class="reasoning-text">{{ recommendation.reason }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card-actions">
        <button 
          mat-raised-button 
          color="primary"
          (click)="requestBook()"
          [disabled]="recommendation.book.status !== 'AVAILABLE'"
          class="request-btn">
          <mat-icon>book</mat-icon>
          Request Book
        </button>
        
        <div class="feedback-buttons">
          <button 
            mat-icon-button 
            (click)="giveFeedback(true)"
            [class.liked]="userFeedback?.liked === true"
            matTooltip="I like this recommendation"
            class="feedback-btn like-btn">
            <mat-icon>thumb_up</mat-icon>
          </button>
          <button 
            mat-icon-button 
            (click)="giveFeedback(false)"
            [class.disliked]="userFeedback?.liked === false"
            matTooltip="Not interested"
            class="feedback-btn dislike-btn">
            <mat-icon>thumb_down</mat-icon>
          </button>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .recommendation-card {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .recommendation-card:hover {
      box-shadow: 0 8px 24px rgba(74, 222, 128, 0.15);
      border-color: var(--accent-primary);
      transform: translateY(-2px);
    }

    .recommendation-card.expanded {
      border-color: var(--accent-primary);
    }

    .card-header {
      display: flex;
      gap: 16px;
      padding: 16px;
      border-bottom: 1px solid var(--border-primary);
    }

    .book-cover {
      flex-shrink: 0;
      width: 80px;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .book-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .book-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .book-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.3;
    }

    .book-author {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .owner-info {
      display: flex;
      align-items: center;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .owner-name {
      color: var(--accent-primary);
      font-weight: 500;
    }

    .book-condition {
      margin-top: auto;
    }

    .condition-chip {
      font-size: 0.75rem;
      height: 24px;
    }

    .recommendation-score {
      padding: 16px;
      background-color: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-primary);
    }

    .score-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .score-value {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .score-number {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--accent-primary);
    }

    .score-stars {
      display: flex;
      gap: 2px;
    }

    .score-stars mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--text-disabled);
    }

    .score-stars mat-icon.filled {
      color: var(--warning);
    }

    .match-factors {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      max-width: 60%;
    }

    .match-chip {
      font-size: 0.7rem;
      height: 20px;
      background-color: rgba(74, 222, 128, 0.2);
      color: var(--accent-primary);
    }

    .reasoning-section {
      border-bottom: 1px solid var(--border-primary);
    }

    .reasoning-toggle {
      width: 100%;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      text-transform: none;
      font-size: 0.9rem;
      border-radius: 0;
    }

    .reasoning-toggle:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .reasoning-content {
      padding: 0 16px 16px;
    }

    .ai-bubble {
      background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(74, 222, 128, 0.05));
      border: 1px solid rgba(74, 222, 128, 0.3);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .ai-icon {
      color: var(--accent-primary);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .reasoning-text {
      margin: 0;
      color: var(--text-primary);
      line-height: 1.5;
      font-size: 0.9rem;
    }

    .card-actions {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .request-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 8px;
    }

    .request-btn:disabled {
      background-color: var(--bg-tertiary);
      color: var(--text-disabled);
    }

    .feedback-buttons {
      display: flex;
      gap: 8px;
    }

    .feedback-btn {
      transition: all 0.2s ease;
    }

    .feedback-btn.liked {
      background-color: rgba(74, 222, 128, 0.2);
      color: var(--success);
    }

    .feedback-btn.disliked {
      background-color: rgba(239, 68, 68, 0.2);
      color: var(--error);
    }

    .feedback-btn:hover {
      transform: scale(1.1);
    }

    @media (max-width: 768px) {
      .card-header {
        flex-direction: column;
        gap: 12px;
      }

      .book-cover {
        align-self: center;
      }

      .score-container {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }

      .match-factors {
        max-width: 100%;
      }

      .card-actions {
        flex-direction: column;
        gap: 12px;
      }

      .feedback-buttons {
        justify-content: center;
      }
    }
  `],
  animations: [
    // Add expand/collapse animation here if needed
  ]
})
export class RecommendationCardComponent {
  @Input() recommendation!: BookRecommendation;
  @Input() userFeedback?: RecommendationFeedback;
  @Output() feedbackGiven = new EventEmitter<RecommendationFeedback>();
  @Output() bookRequested = new EventEmitter<BookRecommendation>();

  showReasoning = false;

  constructor(private dialog: MatDialog) {}

  getScorePercentage(): number {
    return Math.round(this.recommendation.score * 100);
  }

  getStarRating(): number {
    return Math.round(this.recommendation.score * 5);
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  getBookCoverUrl(): string {
    // For now, return a default cover. In the future, this could be enhanced
    // to generate covers based on book title/author or use an external API
    return '/assets/default-book-cover.svg';
  }

  toggleReasoning(): void {
    this.showReasoning = !this.showReasoning;
  }

  requestBook(): void {
    if (this.recommendation.book.status === 'AVAILABLE') {
      const dialogRef = this.dialog.open(CreateRequestComponent, {
        width: '500px',
        data: { book: this.recommendation.book }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.bookRequested.emit(this.recommendation);
        }
      });
    }
  }

  openBookDetails(): void {
    this.dialog.open(BookDetailsComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { book: this.recommendation.book }
    });
  }

  giveFeedback(liked: boolean): void {
    const feedback: RecommendationFeedback = {
      bookId: this.recommendation.book.id,
      liked
    };
    this.feedbackGiven.emit(feedback);
  }
}
