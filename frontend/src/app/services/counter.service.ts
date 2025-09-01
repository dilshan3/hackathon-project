import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Counters } from '../models/common.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  private readonly API_BASE_URL = `${environment.apiUrl}/api`;
  private countersSubject = new BehaviorSubject<Counters>({ incomingPendingRequests: 0, myActiveRequests: 0 });
  
  public counters$ = this.countersSubject.asObservable();

  constructor(private http: HttpClient) {
    // Auto-refresh counters every 30 seconds
    timer(0, 30000).pipe(
      switchMap(() => this.getCounters()),
      catchError(err => {
        console.error('Error fetching counters:', err);
        return [];
      })
    ).subscribe();
  }

  getCounters(): Observable<Counters> {
    return this.http.get<Counters>(`${this.API_BASE_URL}/counters`).pipe(
      tap(counters => this.countersSubject.next(counters))
    );
  }

  refreshCounters(): void {
    this.getCounters().subscribe();
  }

  getCurrentCounters(): Counters {
    return this.countersSubject.value;
  }
}
