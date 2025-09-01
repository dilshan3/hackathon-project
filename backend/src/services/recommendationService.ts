import pool from '@/config/database';
import { 
  BookRecommendation, 
  UserReadingPreferences, 
  RecommendationFeedback,
  AvailableGenre,
  AvailableAuthor,
  DatabaseUserReadingPreferences,
  DatabaseBookRecommendation,
  DatabaseRecommendationFeedback,
  DatabaseAvailableGenre,
  DatabaseAvailableAuthor,
  UpdateReadingPreferencesRequest,
  SubmitFeedbackRequest,
  RecommendationRequest
} from '@/types';
import { ERROR_CODES } from '@/config/constants';

// Helper function to execute queries with timeout
const queryWithTimeout = async (query: string, params: any[], timeoutMs: number = 10000) => {
  return Promise.race([
    pool.query(query, params),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
    )
  ]);
};

export class RecommendationService {
  // Get book recommendations for a user
  static async getRecommendations(request: RecommendationRequest): Promise<BookRecommendation[]> {
    const { userId, limit = 10, excludeOwned = true, genres, minScore = 0 } = request;
    
    let query = `
      SELECT 
        br.id, br.user_id, br.book_id, br.score, br.reasoning, br.created_at,
        b.id as book_id, b.title, b.author, b.genre, b.condition, b.status,
        u.id as owner_id, u.display_name as owner_name, u.city as owner_city
      FROM book_recommendations br
      JOIN books b ON br.book_id = b.id
      JOIN users u ON b.owner_id = u.id
      WHERE br.user_id = $1 AND br.score >= $2 AND b.status = 'AVAILABLE'
    `;
    
    const params: any[] = [userId, minScore];
    let paramCount = 2;
    
    if (excludeOwned) {
      query += ` AND b.owner_id != $${++paramCount}`;
      params.push(userId);
    }
    
    if (genres && genres.length > 0) {
      query += ` AND b.genre = ANY($${++paramCount})`;
      params.push(genres);
    }
    
    query += ` ORDER BY br.score DESC, br.created_at DESC LIMIT $${++paramCount}`;
    params.push(limit);
    
    const result = await queryWithTimeout(query, params) as any;
    
    return result.rows.map((row: any) => this.transformDatabaseRecommendation(row));
  }

  // Generate AI recommendations (simplified ML algorithm)
  static async generateRecommendations(userId: string): Promise<void> {
    // Get user preferences
    const preferences = await this.getUserReadingPreferences(userId);
    
    // Get user's feedback history
    const feedbackQuery = `
      SELECT book_id, liked FROM recommendation_feedback 
      WHERE user_id = $1
    `;
    const feedbackResult = await queryWithTimeout(feedbackQuery, [userId]) as any;
    const userFeedback = new Map<string, boolean>(
      feedbackResult.rows.map((row: any) => [row.book_id, row.liked])
    );
    
    // Get available books (excluding user's own books and already recommended)
    const booksQuery = `
      SELECT b.*, u.display_name as owner_name, u.city as owner_city
      FROM books b
      JOIN users u ON b.owner_id = u.id
      WHERE b.owner_id != $1 
        AND b.status = 'AVAILABLE'
        AND NOT EXISTS (
          SELECT 1 FROM book_recommendations br 
          WHERE br.book_id = b.id AND br.user_id = $1
        )
    `;
    
    const booksResult = await queryWithTimeout(booksQuery, [userId]) as any;
    const availableBooks = booksResult.rows;
    
    // Clear existing recommendations
    await queryWithTimeout(
      'DELETE FROM book_recommendations WHERE user_id = $1',
      [userId]
    );
    
    // Generate recommendations for each book
    const recommendations: any[] = [];
    
    for (const book of availableBooks) {
      const score = this.calculateRecommendationScore(book, preferences, userFeedback);
      const reasoning = this.generateRecommendationReasoning(book, preferences, score);
      
      if (score > 0.1) { // Only save recommendations with meaningful scores
        recommendations.push({
          userId,
          bookId: book.id,
          score: Math.round(score * 100) / 100, // Round to 2 decimal places
          reasoning
        });
      }
    }
    
    // Insert recommendations in batches
    if (recommendations.length > 0) {
      const values = recommendations.map((rec, index) => {
        const baseIndex = index * 4;
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`;
      }).join(', ');
      
      const insertQuery = `
        INSERT INTO book_recommendations (user_id, book_id, score, reasoning)
        VALUES ${values}
      `;
      
      const insertParams = recommendations.flatMap(rec => [rec.userId, rec.bookId, rec.score, rec.reasoning]);
      await queryWithTimeout(insertQuery, insertParams);
    }
  }

  // Calculate recommendation score using simplified ML algorithm
  private static calculateRecommendationScore(
    book: any, 
    preferences: UserReadingPreferences, 
    userFeedback: Map<string, boolean>
  ): number {
    let score = 0.5; // Base score
    
    // Genre preference matching
    if (preferences.genres.length > 0 && book.genre) {
      const genreMatch = preferences.genres.some(prefGenre => 
        prefGenre.toLowerCase() === book.genre.toLowerCase()
      );
      if (genreMatch) {
        score += 0.3;
      } else {
        score -= 0.1;
      }
    }
    
    // Author preference matching
    if (preferences.authors.length > 0 && book.author) {
      const authorMatch = preferences.authors.some(prefAuthor => 
        prefAuthor.toLowerCase() === book.author.toLowerCase()
      );
      if (authorMatch) {
        score += 0.4;
      }
    }
    
    // Book condition preference (new/good books get higher scores)
    switch (book.condition) {
      case 'NEW':
        score += 0.1;
        break;
      case 'GOOD':
        score += 0.05;
        break;
      case 'FAIR':
        score -= 0.05;
        break;
      case 'POOR':
        score -= 0.1;
        break;
    }
    
    // Apply feedback learning (simple collaborative filtering)
    if (userFeedback.size > 0) {
      // Find similar genre books user liked/disliked
      const similarBooks = Array.from(userFeedback.entries()).filter(([bookId, liked]) => {
        // This would need book data to compare genres, simplified for now
        return true;
      });
      
      if (similarBooks.length > 0) {
        const positiveRatio = similarBooks.filter(([_, liked]) => liked).length / similarBooks.length;
        score += (positiveRatio - 0.5) * 0.2; // Adjust based on positive feedback ratio
      }
    }
    
    // Normalize score to 0-1 range
    return Math.max(0, Math.min(1, score));
  }

  // Generate reasoning text for recommendation
  private static generateRecommendationReasoning(
    book: any, 
    preferences: UserReadingPreferences, 
    score: number
  ): string {
    const reasons: string[] = [];
    
    if (preferences.genres.length > 0 && book.genre) {
      const genreMatch = preferences.genres.some(prefGenre => 
        prefGenre.toLowerCase() === book.genre.toLowerCase()
      );
      if (genreMatch) {
        reasons.push(`matches your preferred ${book.genre} genre`);
      }
    }
    
    if (preferences.authors.length > 0 && book.author) {
      const authorMatch = preferences.authors.some(prefAuthor => 
        prefAuthor.toLowerCase() === book.author.toLowerCase()
      );
      if (authorMatch) {
        reasons.push(`by ${book.author}, one of your favorite authors`);
      }
    }
    
    if (book.condition === 'NEW' || book.condition === 'GOOD') {
      reasons.push(`in ${book.condition.toLowerCase()} condition`);
    }
    
    if (score > 0.8) {
      reasons.unshift('Highly recommended:');
    } else if (score > 0.6) {
      reasons.unshift('Good match:');
    } else {
      reasons.unshift('You might like this because it');
    }
    
    return reasons.length > 1 ? reasons.join(' ') : 'Recommended based on your reading preferences';
  }

  // Get user reading preferences
  static async getUserReadingPreferences(userId: string): Promise<UserReadingPreferences> {
    const query = `
      SELECT user_id, genres, authors, reading_goals, book_length, created_at, updated_at
      FROM user_reading_preferences
      WHERE user_id = $1
    `;
    
    const result = await queryWithTimeout(query, [userId]) as any;
    
    if (result.rows.length === 0) {
      // Return default preferences
      return {
        userId,
        genres: [],
        authors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    return this.transformDatabaseUserReadingPreferences(result.rows[0]);
  }

  // Update user reading preferences
  static async updateUserReadingPreferences(
    userId: string, 
    updates: UpdateReadingPreferencesRequest
  ): Promise<UserReadingPreferences> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (updates.genres !== undefined) {
      setClause.push(`genres = $${paramCount++}`);
      values.push(updates.genres);
    }
    
    if (updates.authors !== undefined) {
      setClause.push(`authors = $${paramCount++}`);
      values.push(updates.authors);
    }
    
    if (updates.readingGoals !== undefined) {
      setClause.push(`reading_goals = $${paramCount++}`);
      values.push(updates.readingGoals);
    }
    
    if (updates.bookLength !== undefined) {
      setClause.push(`book_length = $${paramCount++}`);
      values.push(updates.bookLength);
    }
    
    values.push(userId);
    
    let query: string;
    if (setClause.length === 0) {
      throw { error: { code: ERROR_CODES.VALIDATION_ERROR, message: 'No fields to update' } };
    }
    
    // Try to update first
    query = `
      UPDATE user_reading_preferences 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramCount}
      RETURNING user_id, genres, authors, reading_goals, book_length, created_at, updated_at
    `;
    
    let result = await queryWithTimeout(query, values) as any;
    
    // If no rows updated, insert new preferences
    if (result.rows.length === 0) {
      const insertQuery = `
        INSERT INTO user_reading_preferences (user_id, genres, authors, reading_goals, book_length)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id, genres, authors, reading_goals, book_length, created_at, updated_at
      `;
      
      result = await queryWithTimeout(insertQuery, [
        userId,
        updates.genres || [],
        updates.authors || [],
        updates.readingGoals || null,
        updates.bookLength || null
      ]) as any;
    }
    
    // Regenerate recommendations after preference update
    await this.generateRecommendations(userId);
    
    return this.transformDatabaseUserReadingPreferences(result.rows[0]);
  }

  // Submit recommendation feedback
  static async submitFeedback(
    userId: string, 
    feedbackData: SubmitFeedbackRequest
  ): Promise<RecommendationFeedback> {
    const query = `
      INSERT INTO recommendation_feedback (user_id, book_id, liked, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, book_id, liked, reason, created_at
    `;
    
    const result = await queryWithTimeout(query, [
      userId, 
      feedbackData.bookId, 
      feedbackData.liked, 
      feedbackData.reason || null
    ]) as any;
    
    // Regenerate recommendations based on new feedback
    await this.generateRecommendations(userId);
    
    return this.transformDatabaseRecommendationFeedback(result.rows[0]);
  }

  // Get available genres
  static async getAvailableGenres(): Promise<AvailableGenre[]> {
    const query = `
      SELECT id, name, description, created_at
      FROM available_genres
      ORDER BY name
    `;
    
    const result = await queryWithTimeout(query, []) as any;
    
    return result.rows.map((row: DatabaseAvailableGenre) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at.toISOString()
    }));
  }

  // Search authors
  static async searchAuthors(searchTerm: string, limit: number = 20): Promise<AvailableAuthor[]> {
    const query = `
      SELECT DISTINCT author as name
      FROM books 
      WHERE author ILIKE $1 AND author IS NOT NULL
      ORDER BY author
      LIMIT $2
    `;
    
    const result = await queryWithTimeout(query, [`%${searchTerm}%`, limit]) as any;
    
    return result.rows.map((row: any, index: number) => ({
      id: index + 1, // Temporary ID since we're pulling from books table
      name: row.name,
      bio: undefined,
      createdAt: new Date().toISOString()
    }));
  }

  // Transform database user reading preferences to API format
  private static transformDatabaseUserReadingPreferences(
    dbPrefs: DatabaseUserReadingPreferences
  ): UserReadingPreferences {
    return {
      userId: dbPrefs.user_id,
      genres: dbPrefs.genres || [],
      authors: dbPrefs.authors || [],
      readingGoals: dbPrefs.reading_goals || undefined,
      bookLength: dbPrefs.book_length || undefined,
      createdAt: dbPrefs.created_at.toISOString(),
      updatedAt: dbPrefs.updated_at.toISOString()
    };
  }

  // Transform database recommendation to API format
  private static transformDatabaseRecommendation(row: any): BookRecommendation {
    return {
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      score: parseFloat(row.score),
      reasoning: row.reasoning,
      createdAt: row.created_at.toISOString(),
      book: {
        id: row.book_id,
        title: row.title,
        author: row.author,
        genre: row.genre,
        condition: row.condition,
        status: row.status
      }
    };
  }

  // Transform database feedback to API format
  private static transformDatabaseRecommendationFeedback(
    dbFeedback: DatabaseRecommendationFeedback
  ): RecommendationFeedback {
    return {
      id: dbFeedback.id,
      userId: dbFeedback.user_id,
      bookId: dbFeedback.book_id,
      liked: dbFeedback.liked,
      reason: dbFeedback.reason || undefined,
      createdAt: dbFeedback.created_at.toISOString()
    };
  }
}
