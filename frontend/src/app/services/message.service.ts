import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, startWith } from 'rxjs';
import { Message, MessagesResponse, SendMessageRequest } from '../models/request.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly API_BASE_URL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getMessages(requestId: string): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(`${this.API_BASE_URL}/requests/${requestId}/messages`);
  }

  sendMessage(requestId: string, body: string): Observable<Message> {
    const request: SendMessageRequest = { body: body.trim() };
    return this.http.post<Message>(`${this.API_BASE_URL}/requests/${requestId}/messages`, request);
  }

  pollMessages(requestId: string, intervalMs: number = 5000): Observable<MessagesResponse> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.getMessages(requestId))
    );
  }
}
