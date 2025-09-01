import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="book-card">
      <mat-card-content>
        <div class="book-header">
          <h3 class="book-title">{{ book.title }}</h3>
          <div class="book-badges">
            <mat-chip [class]="'condition-' + book.condition.toLowerCase()">
              {{ book.condition }}
            </mat-chip>
            <mat-chip [class]="'status-' + book.status.toLowerCase()">
              {{ book.status }}
            </mat-chip>
          </div>
        </div>
        
        <p class="book-author" *ngIf="book.author">
          <mat-icon class="author-icon">person</mat-icon>
          {{ book.author }}
        </p>
        
        <p class="book-genre" *ngIf="book.genre">
          <mat-icon class="genre-icon">category</mat-icon>
          {{ book.genre }}
        </p>
        
        <div class="book-owner" *ngIf="book.owner && showOwner">
          <mat-icon class="owner-icon">account_circle</mat-icon>
          <span>{{ book.owner.displayName }}</span>
          <span class="owner-city" *ngIf="book.owner.city">({{ book.owner.city }})</span>
        </div>
        
        <div class="book-date">
          <mat-icon class="date-icon">schedule</mat-icon>
          <span>Added {{ book.createdAt | date:'shortDate' }}</span>
        </div>
      </mat-card-content>
      
      <mat-card-actions class="book-actions">
        <button mat-button [routerLink]="['/books', book.id]" color="primary">
          <mat-icon>visibility</mat-icon>
          View
        </button>
        
        <ng-container *ngIf="isOwner">
          <button mat-button [routerLink]="['/books', book.id, 'edit']" color="accent">
            <mat-icon>edit</mat-icon>
            Edit
          </button>
          <button mat-button (click)="onDelete()" color="warn">
            <mat-icon>delete</mat-icon>
            Delete
          </button>
        </ng-container>
        
        <ng-container *ngIf="!isOwner && canRequest">
          <button mat-raised-button (click)="onRequest()" color="primary">
            <mat-icon>send</mat-icon>
            Request
          </button>
        </ng-container>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .book-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .book-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.12);
    }

    .book-card mat-card-content {
      flex: 1;
      padding: 20px;
    }

    .book-header {
      margin-bottom: 16px;
    }

    .book-title {
      margin: 0 0 12px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      line-height: 1.3;
      min-height: 2.6rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .book-badges {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .book-badges mat-chip {
      font-size: 0.75rem;
      font-weight: 500;
      min-height: 24px;
    }

    .condition-new { 
      background-color: #e8f5e8 !important; 
      color: #2e7d32 !important; 
    }
    .condition-good { 
      background-color: #e3f2fd !important; 
      color: #1976d2 !important; 
    }
    .condition-fair { 
      background-color: #fff3e0 !important; 
      color: #f57c00 !important; 
    }
    .condition-poor { 
      background-color: #ffebee !important; 
      color: #d32f2f !important; 
    }

    .status-available { 
      background-color: #e8f5e8 !important; 
      color: #2e7d32 !important; 
    }
    .status-lent { 
      background-color: #fff3e0 !important; 
      color: #f57c00 !important; 
    }
    .status-not_available { 
      background-color: #ffebee !important; 
      color: #d32f2f !important; 
    }

    .book-author,
    .book-genre,
    .book-owner,
    .book-date {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      color: #666;
      font-size: 0.875rem;
    }

    .book-author mat-icon,
    .book-genre mat-icon,
    .book-owner mat-icon,
    .book-date mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #999;
    }

    .owner-city {
      color: #999;
      font-size: 0.8rem;
    }

    .book-actions {
      padding: 16px 20px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .book-actions button {
      font-size: 0.875rem;
    }

    .book-actions button mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      margin-right: 4px;
    }

    @media (max-width: 768px) {
      .book-actions {
        padding: 12px 16px;
      }
      
      .book-actions button {
        font-size: 0.8rem;
        min-width: auto;
        padding: 8px 12px;
      }

      .book-badges {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class BookCardComponent {
  @Input() book!: Book;
  @Input() isOwner = false;
  @Input() showOwner = true;
  @Input() canRequest = false;
  
  @Output() delete = new EventEmitter<Book>();
  @Output() request = new EventEmitter<Book>();

  onDelete(): void {
    this.delete.emit(this.book);
  }

  onRequest(): void {
    this.request.emit(this.book);
  }
}
