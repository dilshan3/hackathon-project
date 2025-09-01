import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebhookService } from './webhook.service';
import { 
  RecommendationRequest, 
  RecommendationsResponse, 
  UserPreferences,
  RecommendationHistory,
  RecommendationFeedback 
} from '../models/recommendation.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly baseUrl = `${environment.apiUrl}/recommendations`;
  private readonly preferencesUrl = `${environment.apiUrl}/user-preferences`;
  
  private userPreferencesSubject = new BehaviorSubject<UserPreferences | null>(null);
  public userPreferences$ = this.userPreferencesSubject.asObservable();
  
  private recommendationHistorySubject = new BehaviorSubject<RecommendationHistory[]>([]);
  public recommendationHistory$ = this.recommendationHistorySubject.asObservable();

  constructor(private http: HttpClient, private webhookService: WebhookService) {
    this.loadUserPreferences();
  }

  /**
   * Get AI-powered book recommendations
   */
  getRecommendations(request: RecommendationRequest): Observable<RecommendationsResponse> {
    return this.http.post<RecommendationsResponse>(this.baseUrl, request).pipe(
      tap(response => {
        // Store in history
        const historyItem: RecommendationHistory = {
          id: Date.now().toString(),
          generatedAt: response.generatedAt,
          preferences: request.preferences as UserPreferences,
          recommendations: response.recommendations
        };
        this.addToHistory(historyItem);
      }),
      catchError(error => {
        console.error('Error fetching recommendations:', error);
        throw error;
      })
    );
  }

  /**
   * Save user reading preferences
   */
  saveUserPreferences(preferences: UserPreferences): Observable<void> {
    return this.http.put<void>(this.preferencesUrl, preferences).pipe(
      tap(() => {
        this.userPreferencesSubject.next(preferences);
        this.savePreferencesToLocalStorage(preferences);
      }),
      catchError(error => {
        console.error('Error saving preferences:', error);
        // Fallback to local storage
        this.savePreferencesToLocalStorage(preferences);
        this.userPreferencesSubject.next(preferences);
        return of(void 0);
      })
    );
  }

  /**
   * Get user reading preferences
   */
  getUserPreferences(): Observable<UserPreferences | null> {
    if (this.userPreferencesSubject.value) {
      return of(this.userPreferencesSubject.value);
    }

    return this.http.get<UserPreferences>(this.preferencesUrl).pipe(
      tap(preferences => {
        this.userPreferencesSubject.next(preferences);
        this.savePreferencesToLocalStorage(preferences);
      }),
      catchError(() => {
        // Fallback to local storage
        const localPreferences = this.loadPreferencesFromLocalStorage();
        this.userPreferencesSubject.next(localPreferences);
        return of(localPreferences);
      })
    );
  }

  /**
   * Submit feedback on recommendation
   */
  submitFeedback(feedback: RecommendationFeedback): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/feedback`, feedback).pipe(
      tap(() => {
        // Send webhook notification for recommendation feedback
        this.sendFeedbackWebhook(feedback);
      }),
      catchError(error => {
        console.error('Error submitting feedback:', error);
        return of(void 0);
      })
    );
  }

  /**
   * Send webhook notification for recommendation feedback
   */
  private sendFeedbackWebhook(feedback: RecommendationFeedback): void {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.webhookService.sendRecommendationFeedbackEvent({
          userId: currentUser.id,
          bookId: feedback.bookId,
          bookTitle: 'Unknown Book', // Would need to be passed or fetched
          liked: feedback.liked,
          recommendationScore: 0.5 // Default score, would need actual scoring
        }).subscribe({
          next: () => console.log('Feedback webhook sent successfully'),
          error: (error) => console.error('Error sending feedback webhook:', error)
        });
      }
    } catch (error) {
      console.error('Error sending feedback webhook:', error);
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

  /**
   * Get recommendation history
   */
  getRecommendationHistory(): Observable<RecommendationHistory[]> {
    return this.http.get<RecommendationHistory[]>(`${this.baseUrl}/history`).pipe(
      tap(history => {
        this.recommendationHistorySubject.next(history);
        this.saveHistoryToLocalStorage(history);
      }),
      catchError(() => {
        // Fallback to local storage
        const localHistory = this.loadHistoryFromLocalStorage();
        this.recommendationHistorySubject.next(localHistory);
        return of(localHistory);
      })
    );
  }

  /**
   * Clear recommendation history
   */
  clearHistory(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/history`).pipe(
      tap(() => {
        this.recommendationHistorySubject.next([]);
        localStorage.removeItem('recommendation_history');
      }),
      catchError(() => {
        this.recommendationHistorySubject.next([]);
        localStorage.removeItem('recommendation_history');
        return of(void 0);
      })
    );
  }

  /**
   * Get quick recommendations based on current preferences
   */
  getQuickRecommendations(maxResults: number = 5): Observable<RecommendationsResponse> {
    const preferences = this.userPreferencesSubject.value;
    if (!preferences) {
      throw new Error('No user preferences available');
    }

    const request: RecommendationRequest = {
      userId: preferences.userId,
      city: '', // Will be populated by backend from user context
      preferences,
      maxResults
    };

    return this.getRecommendations(request);
  }

  /**
   * Check if user has set preferences
   */
  hasPreferences(): boolean {
    const prefs = this.userPreferencesSubject.value;
    return !!(prefs && (prefs.genres?.length || prefs.authors?.length || prefs.readingGoals));
  }

  /**
   * Get available genres for selection
   */
  getAvailableGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/books/genres`).pipe(
      catchError(() => {
        // Fallback genres
        return of([
          'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
          'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
          'Technology', 'Travel', 'Cooking', 'Art', 'Sports', 'Health',
          'Religion', 'Politics', 'Science', 'Education'
        ]);
      })
    );
  }

  /**
   * Search authors for autocomplete
   */
  searchAuthors(query: string): Observable<string[]> {
    const params = new HttpParams().set('q', query).set('limit', '10');
    return this.http.get<string[]>(`${environment.apiUrl}/books/authors/search`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  // Private helper methods
  private loadUserPreferences(): void {
    const stored = this.loadPreferencesFromLocalStorage();
    if (stored) {
      this.userPreferencesSubject.next(stored);
    }
  }

  private savePreferencesToLocalStorage(preferences: UserPreferences): void {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
  }

  private loadPreferencesFromLocalStorage(): UserPreferences | null {
    try {
      const stored = localStorage.getItem('user_preferences');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private addToHistory(item: RecommendationHistory): void {
    const current = this.recommendationHistorySubject.value;
    const updated = [item, ...current].slice(0, 50); // Keep last 50 items
    this.recommendationHistorySubject.next(updated);
    this.saveHistoryToLocalStorage(updated);
  }

  private saveHistoryToLocalStorage(history: RecommendationHistory[]): void {
    localStorage.setItem('recommendation_history', JSON.stringify(history));
  }

  private loadHistoryFromLocalStorage(): RecommendationHistory[] {
    try {
      const stored = localStorage.getItem('recommendation_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}
