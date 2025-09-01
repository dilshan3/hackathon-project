import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BookRequest, CreateRequestRequest } from '../models/request.model';
import { Paged } from '../models/common.model';
import { environment } from '../../environments/environment';
import { WebhookService } from './webhook.service';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private readonly API_BASE_URL = `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private webhookService: WebhookService
  ) {}

  createRequest(requestData: CreateRequestRequest): Observable<BookRequest> {
    return this.http.post<BookRequest>(`${this.API_BASE_URL}/requests`, requestData);
  }

  getRequests(
    role: 'owner' | 'requester',
    status?: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<Paged<BookRequest>> {
    let params = new HttpParams()
      .set('role', role)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<Paged<BookRequest>>(`${this.API_BASE_URL}/requests`, { params });
  }

  getRequest(id: string): Observable<BookRequest> {
    return this.http.get<BookRequest>(`${this.API_BASE_URL}/requests/${id}`);
  }

  approveRequest(id: string): Observable<BookRequest> {
    return this.http.post<BookRequest>(`${this.API_BASE_URL}/requests/${id}/approve`, {}).pipe(
      tap((request) => {
        this.sendRequestStatusWebhook(request, 'approved');
      })
    );
  }

  declineRequest(id: string): Observable<BookRequest> {
    return this.http.post<BookRequest>(`${this.API_BASE_URL}/requests/${id}/decline`, {}).pipe(
      tap((request) => {
        this.sendRequestStatusWebhook(request, 'declined');
      })
    );
  }

  completeRequest(id: string): Observable<BookRequest> {
    return this.http.post<BookRequest>(`${this.API_BASE_URL}/requests/${id}/complete`, {}).pipe(
      tap((request) => {
        this.sendRequestStatusWebhook(request, 'completed');
      })
    );
  }

  /**
   * Send webhook notification for request status changes
   */
  private sendRequestStatusWebhook(request: BookRequest, action: string): void {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.webhookService.sendCustomEvent('request_status_changed', {
          requestId: request.id,
          bookId: request.bookId,
          bookTitle: request.book?.title || 'Unknown Book',
          requesterId: request.requesterId,
          requesterName: request.requester?.displayName || 'Unknown Requester',
          ownerId: request.ownerId,
          ownerName: request.owner?.displayName || 'Unknown Owner',
          status: request.status,
          action: action,
          userId: currentUser.id
        }).subscribe({
          next: () => console.log(`Request ${action} webhook sent successfully`),
          error: (error) => console.error(`Error sending request ${action} webhook:`, error)
        });
      }
    } catch (error) {
      console.error('Error sending request status webhook:', error);
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
