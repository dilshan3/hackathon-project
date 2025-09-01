import pool from '@/config/database';
import { Book, DatabaseBook, CreateBookRequest, UpdateBookRequest, Paged } from '@/types';
import { ERROR_CODES } from '@/config/constants';
import { UserService } from './userService';

// Helper function to execute queries with timeout
const queryWithTimeout = async (query: string, params: any[], timeoutMs: number = 10000) => {
  return Promise.race([
    pool.query(query, params),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
    )
  ]);
};

export class BookService {
  // Create a new book
  static async createBook(ownerId: string, bookData: CreateBookRequest): Promise<Book> {
    const { title, author, genre, condition, status } = bookData;
    
    const query = `
      INSERT INTO books (owner_id, title, author, genre, condition, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, owner_id, title, author, genre, condition, status, created_at
    `;
    
    const result = await queryWithTimeout(query, [ownerId, title, author, genre, condition, status]) as any;
    const dbBook = result.rows[0];
    
    return this.transformDatabaseBook(dbBook);
  }

  // Get user's own books with pagination
  static async getMyBooks(ownerId: string, page: number = 1, pageSize: number = 20): Promise<Paged<Book>> {
    const offset = (page - 1) * pageSize;
    
    const countQuery = `
      SELECT COUNT(*) FROM books WHERE owner_id = $1
    `;
    
    const booksQuery = `
      SELECT id, owner_id, title, author, genre, condition, status, created_at
      FROM books 
      WHERE owner_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const [countResult, booksResult] = await Promise.all([
      queryWithTimeout(countQuery, [ownerId]),
      queryWithTimeout(booksQuery, [ownerId, pageSize, offset])
    ]);
    
    const total = parseInt((countResult as any).rows[0].count);
    const books = (booksResult as any).rows.map(this.transformDatabaseBook);
    
    return {
      items: books,
      total,
      page,
      pageSize
    };
  }

  // Search and discover books (public)
  static async searchBooks(
    query?: string,
    city?: string,
    status: string = 'AVAILABLE',
    page: number = 1,
    pageSize: number = 20
  ): Promise<Paged<Book>> {
    const offset = (page - 1) * pageSize;
    const params: any[] = [];
    let paramCount = 1;
    
    let whereClause = 'WHERE b.status = $1';
    params.push(status);
    paramCount++;
    
    if (query) {
      whereClause += ` AND (b.title ILIKE $${paramCount} OR b.author ILIKE $${paramCount} OR b.genre ILIKE $${paramCount})`;
      params.push(`%${query}%`);
      paramCount++;
    }
    
    if (city) {
      whereClause += ` AND u.city = $${paramCount}`;
      params.push(city);
      paramCount++;
    }
    
    const countQuery = `
      SELECT COUNT(*) 
      FROM books b
      JOIN users u ON b.owner_id = u.id
      ${whereClause}
    `;
    
    const booksQuery = `
      SELECT b.id, b.owner_id, b.title, b.author, b.genre, b.condition, b.status, b.created_at,
             u.id as owner_id, u.display_name as owner_display_name, u.city as owner_city
      FROM books b
      JOIN users u ON b.owner_id = u.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(pageSize, offset);
    
    const [countResult, booksResult] = await Promise.all([
      queryWithTimeout(countQuery, params.slice(0, -2)),
      queryWithTimeout(booksQuery, params)
    ]);
    
    const total = parseInt((countResult as any).rows[0].count);
    const books = (booksResult as any).rows.map((row: any) => ({
      id: row.id,
      ownerId: row.owner_id,
      title: row.title,
      author: row.author,
      genre: row.genre,
      condition: row.condition,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      owner: {
        id: row.owner_id,
        displayName: row.owner_display_name,
        city: row.owner_city
      }
    }));
    
    return {
      items: books,
      total,
      page,
      pageSize
    };
  }

  // Get book by ID with owner details
  static async getBookById(id: string): Promise<Book | null> {
    const query = `
      SELECT b.id, b.owner_id, b.title, b.author, b.genre, b.condition, b.status, b.created_at,
             u.id as owner_id, u.display_name as owner_display_name, u.city as owner_city
      FROM books b
      JOIN users u ON b.owner_id = u.id
      WHERE b.id = $1
    `;
    
    const result = await queryWithTimeout(query, [id]) as any;
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      ownerId: row.owner_id,
      title: row.title,
      author: row.author,
      genre: row.genre,
      condition: row.condition,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      owner: {
        id: row.owner_id,
        displayName: row.owner_display_name,
        city: row.owner_city
      }
    };
  }

  // Update book (owner only)
  static async updateBook(bookId: string, ownerId: string, updates: UpdateBookRequest): Promise<Book> {
    // Verify ownership
    const existingBook = await this.getBookById(bookId);
    if (!existingBook) {
      throw { error: { code: ERROR_CODES.NOT_FOUND, message: 'Book not found' } };
    }
    
    if (existingBook.ownerId !== ownerId) {
      throw { error: { code: ERROR_CODES.FORBIDDEN_NOT_OWNER, message: 'You can only edit your own books' } };
    }
    
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (updates.title !== undefined) {
      setClause.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    
    if (updates.author !== undefined) {
      setClause.push(`author = $${paramCount++}`);
      values.push(updates.author);
    }
    
    if (updates.genre !== undefined) {
      setClause.push(`genre = $${paramCount++}`);
      values.push(updates.genre);
    }
    
    if (updates.condition !== undefined) {
      setClause.push(`condition = $${paramCount++}`);
      values.push(updates.condition);
    }
    
    if (updates.status !== undefined) {
      setClause.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    
    if (setClause.length === 0) {
      throw { error: { code: ERROR_CODES.VALIDATION_ERROR, message: 'No fields to update' } };
    }
    
    values.push(bookId);
    
    const query = `
      UPDATE books 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, owner_id, title, author, genre, condition, status, created_at
    `;
    
    const result = await queryWithTimeout(query, values) as any;
    const dbBook = result.rows[0];
    
    return this.transformDatabaseBook(dbBook);
  }

  // Delete book (owner only)
  static async deleteBook(bookId: string, ownerId: string): Promise<void> {
    // Verify ownership
    const existingBook = await this.getBookById(bookId);
    if (!existingBook) {
      throw { error: { code: ERROR_CODES.NOT_FOUND, message: 'Book not found' } };
    }
    
    if (existingBook.ownerId !== ownerId) {
      throw { error: { code: ERROR_CODES.FORBIDDEN_NOT_OWNER, message: 'You can only delete your own books' } };
    }
    
    const query = `DELETE FROM books WHERE id = $1`;
    await queryWithTimeout(query, [bookId]);
  }

  // Transform database book to API book
  private static transformDatabaseBook(dbBook: DatabaseBook): Book {
    return {
      id: dbBook.id,
      ownerId: dbBook.owner_id,
      title: dbBook.title,
      author: dbBook.author,
      genre: dbBook.genre,
      condition: dbBook.condition,
      status: dbBook.status,
      createdAt: dbBook.created_at.toISOString()
    };
  }
}
