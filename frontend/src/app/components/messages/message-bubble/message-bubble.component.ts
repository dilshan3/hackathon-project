import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Message } from '../../../models/request.model';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="message-bubble" [class.own-message]="isOwnMessage" [class.other-message]="!isOwnMessage">
      <div class="message-content">
        <div class="message-header" *ngIf="!isOwnMessage">
          <span class="sender-name">{{ senderName }}</span>
        </div>
        <div class="message-body">{{ message.body }}</div>
        <div class="message-timestamp">{{ getFormattedTime() }}</div>
      </div>
    </div>
  `,
  styles: [`
    .message-bubble {
      display: flex;
      margin-bottom: 12px;
      max-width: 70%;
      word-wrap: break-word;
    }

    .own-message {
      justify-content: flex-end;
      margin-left: auto;
    }

    .other-message {
      justify-content: flex-start;
      margin-right: auto;
    }

    .message-content {
      padding: 12px 16px;
      border-radius: 18px;
      position: relative;
    }

    .own-message .message-content {
      background-color: var(--accent-primary);
      color: #000000;
      border-bottom-right-radius: 6px;
    }

    .other-message .message-content {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      border-bottom-left-radius: 6px;
    }

    .message-header {
      margin-bottom: 4px;
    }

    .sender-name {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--accent-primary);
    }

    .message-body {
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 4px;
      white-space: pre-wrap;
    }

    .message-timestamp {
      font-size: 0.7rem;
      opacity: 0.7;
      text-align: right;
      margin-top: 4px;
    }

    .own-message .message-timestamp {
      color: #000000;
    }

    .other-message .message-timestamp {
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .message-bubble {
        max-width: 85%;
      }
      
      .message-content {
        padding: 10px 14px;
      }
    }
  `]
})
export class MessageBubbleComponent {
  @Input() message!: Message;
  @Input() isOwnMessage: boolean = false;
  @Input() senderName: string = '';

  getFormattedTime(): string {
    const messageDate = new Date(this.message.createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      // More than 24 hours, show date
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
