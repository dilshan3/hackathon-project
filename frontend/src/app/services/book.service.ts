import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, CreateBookRequest, UpdateBookRequest } from '../models/book.model';
import { Paged } from '../models/common.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly API_BASE_URL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  addBook(bookData: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(`${this.API_BASE_URL}/books`, bookData);
  }

  getMyBooks(page: number = 1, pageSize: number = 20): Observable<Paged<Book>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<Paged<Book>>(`${this.API_BASE_URL}/books/mine`, { params });
  }

  searchBooks(
    query?: string,
    city?: string,
    status?: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<Paged<Book>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (query) {
      params = params.set('query', query);
    }
    if (city) {
      params = params.set('city', city);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<Paged<Book>>(`${this.API_BASE_URL}/books`, { params });
  }

  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.API_BASE_URL}/books/${id}`);
  }

  updateBook(id: string, updates: UpdateBookRequest): Observable<Book> {
    return this.http.put<Book>(`${this.API_BASE_URL}/books/${id}`, updates);
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/books/${id}`);
  }
}
