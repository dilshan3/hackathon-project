import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookRequest, CreateRequestRequest } from '../models/request.model';
import { Paged } from '../models/common.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private readonly API_BASE_URL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

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
    return this.http.post<BookRequest>(`${this.API_BASE_URL}/requests/${id}/approve`, {});
  }

  declineRequest(id: string): Observable<BookRequest> {
    return this.http.post<BookRequest>(`${this.API_BASE_URL}/requests/${id}/decline`, {});
  }

  completeRequest(id: string): Observable<BookRequest> {
    return this.http.post<BookRequest>(`${this.API_BASE_URL}/requests/${id}/complete`, {});
  }
}
