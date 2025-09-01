import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp?: string;
  userId?: string;
}

export interface WebhookResponse {
  success: boolean;
  message?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebhookService {
  private readonly n8nWebhookUrl = 'https://milinda27.app.n8n.cloud/webhook-test/fb709a6c-71af-4f42-862c-1dc3f8644f38';

  constructor(private http: HttpClient) {}

  /**
   * Send data to n8n webhook
   */
  sendToWebhook(payload: WebhookPayload): Observable<any> {
    // Since the webhook is configured for GET requests, we'll send data as query parameters
    let params = new HttpParams()
      .set('event', payload.event)
      .set('timestamp', payload.timestamp || new Date().toISOString());

    if (payload.userId) {
      params = params.set('userId', payload.userId);
    }

    // Convert data object to query parameters
    if (payload.data && typeof payload.data === 'object') {
      Object.keys(payload.data).forEach(key => {
        const value = payload.data[key];
        if (value !== null && value !== undefined) {
          params = params.set(`data.${key}`, String(value));
        }
      });
    }

    console.log('Sending webhook data:', { payload, params: params.toString() });

    return this.http.get(this.n8nWebhookUrl, { params }).pipe(
      tap(response => {
        console.log('Webhook response:', response);
      }),
      catchError(error => {
        console.error('Webhook error:', error);
        // Don't throw error to prevent breaking the main flow
        return throwError(() => error);
      })
    );
  }

  /**
   * Send book request event to webhook
   */
  sendBookRequestEvent(requestData: {
    bookId: string;
    bookTitle: string;
    requesterId: string;
    requesterName: string;
    ownerId: string;
    ownerName: string;
    startDate: string;
    durationDays: number;
  }): Observable<any> {
    const payload: WebhookPayload = {
      event: 'book_request_created',
      data: requestData,
      timestamp: new Date().toISOString(),
      userId: requestData.requesterId
    };

    return this.sendToWebhook(payload);
  }

  /**
   * Send book request status change event
   */
  sendRequestStatusChangeEvent(statusData: {
    requestId: string;
    bookTitle: string;
    status: string;
    requesterId: string;
    requesterName: string;
    ownerId: string;
    ownerName: string;
  }): Observable<any> {
    const payload: WebhookPayload = {
      event: 'request_status_changed',
      data: statusData,
      timestamp: new Date().toISOString(),
      userId: statusData.ownerId
    };

    return this.sendToWebhook(payload);
  }

  /**
   * Send user registration event
   */
  sendUserRegistrationEvent(userData: {
    userId: string;
    email: string;
    displayName: string;
    city?: string;
  }): Observable<any> {
    const payload: WebhookPayload = {
      event: 'user_registered',
      data: userData,
      timestamp: new Date().toISOString(),
      userId: userData.userId
    };

    return this.sendToWebhook(payload);
  }

  /**
   * Send book added event
   */
  sendBookAddedEvent(bookData: {
    bookId: string;
    title: string;
    author?: string;
    genre?: string;
    ownerId: string;
    ownerName: string;
    city?: string;
  }): Observable<any> {
    const payload: WebhookPayload = {
      event: 'book_added',
      data: bookData,
      timestamp: new Date().toISOString(),
      userId: bookData.ownerId
    };

    return this.sendToWebhook(payload);
  }

  /**
   * Send recommendation feedback event
   */
  sendRecommendationFeedbackEvent(feedbackData: {
    userId: string;
    bookId: string;
    bookTitle: string;
    liked: boolean;
    recommendationScore: number;
  }): Observable<any> {
    const payload: WebhookPayload = {
      event: 'recommendation_feedback',
      data: feedbackData,
      timestamp: new Date().toISOString(),
      userId: feedbackData.userId
    };

    return this.sendToWebhook(payload);
  }

  /**
   * Send message sent event
   */
  sendMessageEvent(messageData: {
    requestId: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    receiverName: string;
    messageBody: string;
    bookTitle: string;
  }): Observable<any> {
    const payload: WebhookPayload = {
      event: 'message_sent',
      data: messageData,
      timestamp: new Date().toISOString(),
      userId: messageData.senderId
    };

    return this.sendToWebhook(payload);
  }

  /**
   * Send custom event
   */
  sendCustomEvent(eventName: string, data: any, userId?: string): Observable<any> {
    const payload: WebhookPayload = {
      event: eventName,
      data,
      timestamp: new Date().toISOString(),
      userId
    };

    return this.sendToWebhook(payload);
  }
}
