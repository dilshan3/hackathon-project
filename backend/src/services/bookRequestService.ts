import pool from '@/config/database';
import { BookRequest, DatabaseBookRequest, CreateBookRequestRequest, Paged } from '@/types';
import { ERROR_CODES } from '@/config/constants';
import { BookService } from './bookService';
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

export class BookRequestService {
  // Create a new book request
  static async createRequest(requesterId: string, requestData: CreateBookRequestRequest): Promise<BookRequest> {
    const { bookId, startDate, durationDays, note } = requestData;
    
    // Check if book exists and is available
    const book = await BookService.getBookById(bookId);
    if (!book) {
      throw { error: { code: ERROR_CODES.NOT_FOUND, message: 'Book not found' } };
    }
    
    if (book.status !== 'AVAILABLE') {
      throw { error: { code: ERROR_CODES.BOOK_NOT_AVAILABLE, message: 'Book is not available for borrowing' } };
    }
    
    if (book.ownerId === requesterId) {
      throw { error: { code: ERROR_CODES.FORBIDDEN, message: 'You cannot request your own book' } };
    }
    
    const query = `
      INSERT INTO book_requests (book_id, requester_id, owner_id, start_date, duration_days, note)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, book_id, requester_id, owner_id, status, note, start_date, duration_days, created_at, updated_at
    `;
    
    const result = await queryWithTimeout(query, [bookId, requesterId, book.ownerId, startDate, durationDays, note]) as any;
    const dbRequest = result.rows[0];
    
    return this.transformDatabaseRequest(dbRequest);
  }

  // Get requests for a user (as owner or requester)
  static async getRequests(
    userId: string, 
    role: 'owner' | 'requester',
    status?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<Paged<BookRequest>> {
    const offset = (page - 1) * pageSize;
    const params: any[] = [];
    let paramCount = 1;
    
    let whereClause = role === 'owner' 
      ? 'WHERE br.owner_id = $1'
      : 'WHERE br.requester_id = $1';
    params.push(userId);
    paramCount++;
    
    if (status) {
      whereClause += ` AND br.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    const countQuery = `
      SELECT COUNT(*) FROM book_requests br ${whereClause}
    `;
    
    const requestsQuery = `
      SELECT br.id, br.book_id, br.requester_id, br.owner_id, br.status, br.note, 
             br.start_date, br.duration_days, br.created_at, br.updated_at,
             b.id as book_id, b.title as book_title, b.author as book_author, b.condition as book_condition,
             u1.id as requester_id, u1.display_name as requester_display_name, u1.city as requester_city,
             u2.id as owner_id, u2.display_name as owner_display_name, u2.city as owner_city
      FROM book_requests br
      JOIN books b ON br.book_id = b.id
      JOIN users u1 ON br.requester_id = u1.id
      JOIN users u2 ON br.owner_id = u2.id
      ${whereClause}
      ORDER BY br.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(pageSize, offset);
    
    const [countResult, requestsResult] = await Promise.all([
      queryWithTimeout(countQuery, params.slice(0, -2)),
      queryWithTimeout(requestsQuery, params)
    ]);
    
    const total = parseInt((countResult as any).rows[0].count);
    const requests = (requestsResult as any).rows.map((row: any) => ({
      id: row.id,
      bookId: row.book_id,
      requesterId: row.requester_id,
      ownerId: row.owner_id,
      status: row.status,
      note: row.note,
      startDate: row.start_date?.toISOString().split('T')[0],
      durationDays: row.duration_days,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      book: {
        id: row.book_id,
        title: row.book_title,
        author: row.book_author,
        condition: row.book_condition
      },
      requester: {
        id: row.requester_id,
        displayName: row.requester_display_name,
        city: row.requester_city
      },
      owner: {
        id: row.owner_id,
        displayName: row.owner_display_name,
        city: row.owner_city
      }
    }));
    
    return {
      items: requests,
      total,
      page,
      pageSize
    };
  }

  // Get request by ID
  static async getRequestById(requestId: string, userId: string): Promise<BookRequest | null> {
    const query = `
      SELECT br.id, br.book_id, br.requester_id, br.owner_id, br.status, br.note, 
             br.start_date, br.duration_days, br.created_at, br.updated_at,
             b.id as book_id, b.title as book_title, b.author as book_author, b.condition as book_condition,
             u1.id as requester_id, u1.display_name as requester_display_name, u1.city as requester_city,
             u2.id as owner_id, u2.display_name as owner_display_name, u2.city as owner_city
      FROM book_requests br
      JOIN books b ON br.book_id = b.id
      JOIN users u1 ON br.requester_id = u1.id
      JOIN users u2 ON br.owner_id = u2.id
      WHERE br.id = $1 AND (br.requester_id = $2 OR br.owner_id = $2)
    `;
    
    const result = await queryWithTimeout(query, [requestId, userId]) as any;
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      bookId: row.book_id,
      requesterId: row.requester_id,
      ownerId: row.owner_id,
      status: row.status,
      note: row.note,
      startDate: row.start_date?.toISOString().split('T')[0],
      durationDays: row.duration_days,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      book: {
        id: row.book_id,
        title: row.book_title,
        author: row.book_author,
        condition: row.book_condition
      },
      requester: {
        id: row.requester_id,
        displayName: row.requester_display_name,
        city: row.requester_city
      },
      owner: {
        id: row.owner_id,
        displayName: row.owner_display_name,
        city: row.owner_city
      }
    };
  }

  // Approve request (owner only)
  static async approveRequest(requestId: string, ownerId: string): Promise<BookRequest> {
    const request = await this.getRequestById(requestId, ownerId);
    if (!request) {
      throw { error: { code: ERROR_CODES.NOT_FOUND, message: 'Request not found' } };
    }
    
    if (request.ownerId !== ownerId) {
      throw { error: { code: ERROR_CODES.FORBIDDEN, message: 'Only the book owner can approve requests' } };
    }
    
    if (request.status !== 'PENDING') {
      throw { error: { code: ERROR_CODES.ALREADY_DECIDED, message: 'Request has already been processed' } };
    }
    
    // Update request status and book status in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update request status
      const updateRequestQuery = `
        UPDATE book_requests 
        SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, book_id, requester_id, owner_id, status, note, start_date, duration_days, created_at, updated_at
      `;
      
      const requestResult = await client.query(updateRequestQuery, [requestId]);
      
      // Update book status to LENT
      const updateBookQuery = `
        UPDATE books 
        SET status = 'LENT', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      await client.query(updateBookQuery, [request.bookId]);
      
      await client.query('COMMIT');
      
      const dbRequest = requestResult.rows[0];
      return this.transformDatabaseRequest(dbRequest);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Decline request (owner only)
  static async declineRequest(requestId: string, ownerId: string): Promise<BookRequest> {
    const request = await this.getRequestById(requestId, ownerId);
    if (!request) {
      throw { error: { code: ERROR_CODES.NOT_FOUND, message: 'Request not found' } };
    }
    
    if (request.ownerId !== ownerId) {
      throw { error: { code: ERROR_CODES.FORBIDDEN, message: 'Only the book owner can decline requests' } };
    }
    
    if (request.status !== 'PENDING') {
      throw { error: { code: ERROR_CODES.ALREADY_DECIDED, message: 'Request has already been processed' } };
    }
    
    const query = `
      UPDATE book_requests 
      SET status = 'DECLINED', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, book_id, requester_id, owner_id, status, note, start_date, duration_days, created_at, updated_at
    `;
    
    const result = await queryWithTimeout(query, [requestId]) as any;
    const dbRequest = result.rows[0];
    
    return this.transformDatabaseRequest(dbRequest);
  }

  // Complete request (owner or requester)
  static async completeRequest(requestId: string, userId: string): Promise<BookRequest> {
    const request = await this.getRequestById(requestId, userId);
    if (!request) {
      throw { error: { code: ERROR_CODES.NOT_FOUND, message: 'Request not found' } };
    }
    
    if (request.requesterId !== userId && request.ownerId !== userId) {
      throw { error: { code: ERROR_CODES.FORBIDDEN_NOT_PARTY, message: 'You are not part of this request' } };
    }
    
    if (request.status !== 'APPROVED') {
      throw { error: { code: ERROR_CODES.VALIDATION_ERROR, message: 'Only approved requests can be completed' } };
    }
    
    // Update request status and book status in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update request status
      const updateRequestQuery = `
        UPDATE book_requests 
        SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, book_id, requester_id, owner_id, status, note, start_date, duration_days, created_at, updated_at
      `;
      
      const requestResult = await client.query(updateRequestQuery, [requestId]);
      
      // Update book status back to AVAILABLE
      const updateBookQuery = `
        UPDATE books 
        SET status = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      await client.query(updateBookQuery, [request.bookId]);
      
      await client.query('COMMIT');
      
      const dbRequest = requestResult.rows[0];
      return this.transformDatabaseRequest(dbRequest);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get counters for header badges
  static async getCounters(userId: string): Promise<{ incomingPendingRequests: number; myActiveRequests: number }> {
    const [incomingResult, activeResult] = await Promise.all([
      queryWithTimeout(
        'SELECT COUNT(*) FROM book_requests WHERE owner_id = $1 AND status = $2',
        [userId, 'PENDING']
      ),
      queryWithTimeout(
        'SELECT COUNT(*) FROM book_requests WHERE requester_id = $1 AND status IN ($2, $3)',
        [userId, 'PENDING', 'APPROVED']
      )
    ]);
    
    return {
      incomingPendingRequests: parseInt((incomingResult as any).rows[0].count),
      myActiveRequests: parseInt((activeResult as any).rows[0].count)
    };
  }

  // Transform database request to API request
  private static transformDatabaseRequest(dbRequest: DatabaseBookRequest): BookRequest {
    return {
      id: dbRequest.id,
      bookId: dbRequest.book_id,
      requesterId: dbRequest.requester_id,
      ownerId: dbRequest.owner_id,
      status: dbRequest.status,
      note: dbRequest.note,
      startDate: dbRequest.start_date?.toISOString().split('T')[0],
      durationDays: dbRequest.duration_days,
      createdAt: dbRequest.created_at.toISOString(),
      updatedAt: dbRequest.updated_at.toISOString()
    };
  }
}
