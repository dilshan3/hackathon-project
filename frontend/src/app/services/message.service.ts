import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, startWith, tap } from 'rxjs';
import { Message, MessagesResponse, SendMessageRequest } from '../models/request.model';
import { environment } from '../../environments/environment';
import { WebhookService } from './webhook.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly API_BASE_URL = `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private webhookService: WebhookService
  ) {}

  getMessages(requestId: string): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(`${this.API_BASE_URL}/requests/${requestId}/messages`);
  }

  sendMessage(requestId: string, body: string): Observable<Message> {
    const request: SendMessageRequest = { body: body.trim() };
    return this.http.post<Message>(`${this.API_BASE_URL}/requests/${requestId}/messages`, request).pipe(
      tap((message) => {
        // Send webhook notification for new message
        this.sendMessageWebhook(requestId, message);
      })
    );
  }

  pollMessages(requestId: string, intervalMs: number = 5000): Observable<MessagesResponse> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.getMessages(requestId))
    );
  }

  /**
   * Send webhook notification for new message
   */
  private sendMessageWebhook(requestId: string, message: Message): void {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.webhookService.sendMessageEvent({
          requestId: requestId,
          senderId: message.senderId,
          senderName: currentUser.name || 'Unknown User',
          receiverId: '', // Would need to be fetched from request data
          receiverName: 'Unknown Recipient',
          messageBody: message.body,
          bookTitle: 'Unknown Book' // Would need to be fetched from request data
        }).subscribe({
          next: () => console.log('Message webhook sent successfully'),
          error: (error) => console.error('Error sending message webhook:', error)
        });
      }
    } catch (error) {
      console.error('Error sending message webhook:', error);
    }
  }

  /**
   * Get current user from local storage
   */
  private getCurrentUser(): any {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
}
