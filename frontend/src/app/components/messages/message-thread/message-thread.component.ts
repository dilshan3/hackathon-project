import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { Message, BookRequest } from '../../../models/request.model';
import { MessageService } from '../../../services/message.service';
import { AuthService } from '../../../services/auth.service';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MessageBubbleComponent,
    MessageInputComponent
  ],
  template: `
    <div class="message-thread-container">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="chat-info">
          <h3>{{ request.book?.title }}</h3>
          <p class="participants">
            Chat between {{ getParticipantNames() }}
          </p>
        </div>
        <button mat-icon-button (click)="refreshMessages()" [disabled]="isLoading" class="refresh-btn">
          <mat-icon [class.spinning]="isLoading">refresh</mat-icon>
        </button>
      </div>

      <!-- Messages Area -->
      <div class="messages-container" #messagesContainer>
        <div *ngIf="isLoading && messages.length === 0" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading messages...</p>
        </div>

        <div *ngIf="!isLoading && messages.length === 0" class="empty-state">
          <mat-icon class="empty-icon">chat_bubble_outline</mat-icon>
          <h4>No messages yet</h4>
          <p>Start the conversation by sending a message below.</p>
        </div>

        <div *ngIf="messages.length > 0" class="messages-list">
          <app-message-bubble
            *ngFor="let message of messages; trackBy: trackMessage"
            [message]="message"
            [isOwnMessage]="isOwnMessage(message)"
            [senderName]="getSenderName(message)">
          </app-message-bubble>
        </div>
      </div>

      <!-- Message Input -->
      <app-message-input 
        #messageInput
        (messageSent)="onMessageSent($event)">
      </app-message-input>
    </div>
  `,
  styles: [`
    .message-thread-container {
      display: flex;
      flex-direction: column;
      height: 500px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border-primary);
      border-radius: 12px;
      overflow: hidden;
    }

    .chat-header {
      padding: 16px;
      background-color: var(--bg-secondary);
      border-bottom: 1px solid var(--border-primary);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-info h3 {
      margin: 0 0 4px 0;
      color: var(--text-primary);
      font-size: 1.1rem;
      font-weight: 600;
    }

    .participants {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .refresh-btn {
      color: var(--text-muted);
    }

    .refresh-btn:hover {
      color: var(--text-primary);
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 0 16px;
      background-color: var(--bg-primary);
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-muted);
      text-align: center;
      gap: 12px;
    }

    .empty-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: var(--text-disabled);
    }

    .empty-state h4 {
      margin: 0;
      color: var(--text-primary);
      font-weight: 500;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
    }

    .messages-list {
      padding: 16px 0;
      display: flex;
      flex-direction: column;
    }

    /* Custom scrollbar */
    .messages-container::-webkit-scrollbar {
      width: 6px;
    }

    .messages-container::-webkit-scrollbar-track {
      background: transparent;
    }

    .messages-container::-webkit-scrollbar-thumb {
      background: #2d3439;
      border-radius: 3px;
    }

    .messages-container::-webkit-scrollbar-thumb:hover {
      background: #4b5563;
    }

    @media (max-width: 768px) {
      .message-thread-container {
        height: 400px;
      }
      
      .chat-header {
        padding: 12px;
      }
      
      .chat-info h3 {
        font-size: 1rem;
      }
      
      .participants {
        font-size: 0.8rem;
      }
      
      .messages-container {
        padding: 0 12px;
      }
    }
  `]
})
export class MessageThreadComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() request!: BookRequest;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: MessageInputComponent;

  messages: Message[] = [];
  isLoading = false;
  currentUserId: string | null = null;
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUserId = user?.id || null;
      });

    this.loadMessages();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadMessages(): void {
    if (!this.request?.id) return;

    this.isLoading = true;
    this.messageService.getMessages(this.request.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const hadMessages = this.messages.length > 0;
          const newMessageCount = response.items.length;
          
          this.messages = response.items;
          this.isLoading = false;

          // Scroll to bottom if it's the first load or new messages arrived
          if (!hadMessages || newMessageCount > this.messages.length) {
            this.shouldScrollToBottom = true;
          }
        },
        error: (error) => {
          console.error('Error loading messages:', error);
          this.isLoading = false;
          
          if (error.status === 403) {
            this.snackBar.open('You don\'t have access to this conversation', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          } else {
            this.snackBar.open('Failed to load messages', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        }
      });
  }

  refreshMessages(): void {
    this.loadMessages();
  }

  startPolling(): void {
    // Poll for new messages every 5 seconds
    this.messageService.pollMessages(this.request.id, 5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const previousCount = this.messages.length;
          this.messages = response.items;
          
          // If new messages arrived, scroll to bottom
          if (response.items.length > previousCount) {
            this.shouldScrollToBottom = true;
          }
        },
        error: (error) => {
          console.error('Error polling messages:', error);
        }
      });
  }

  onMessageSent(body: string): void {
    if (!this.request?.id) return;

    this.messageService.sendMessage(this.request.id, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          // Add the new message to the list
          this.messages = [...this.messages, message];
          this.shouldScrollToBottom = true;
          
          // Clear the input
          this.messageInput.clearInput();
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.messageInput.setLoading(false);
          
          if (error.status === 403) {
            this.snackBar.open('You don\'t have access to this conversation', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          } else {
            this.snackBar.open('Failed to send message. Please try again.', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        }
      });
  }

  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  getSenderName(message: Message): string {
    if (this.isOwnMessage(message)) {
      return 'You';
    }
    
    // Determine if sender is the requester or owner
    if (message.senderId === this.request?.requesterId) {
      return this.request?.requester?.displayName || 'Requester';
    } else if (message.senderId === this.request?.ownerId) {
      return this.request?.owner?.displayName || 'Owner';
    }
    
    return 'Unknown';
  }

  getParticipantNames(): string {
    const requesterName = this.request?.requester?.displayName || 'Requester';
    const ownerName = this.request?.owner?.displayName || 'Owner';
    return `${requesterName} and ${ownerName}`;
  }

  trackMessage(index: number, message: Message): string {
    return message.id;
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
