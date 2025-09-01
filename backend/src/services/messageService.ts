import pool from '@/config/database';
import { Message, DatabaseMessage, CreateMessageRequest } from '@/types';
import { ERROR_CODES } from '@/config/constants';
import { BookRequestService } from './bookRequestService';

// Helper function to execute queries with timeout
const queryWithTimeout = async (query: string, params: any[], timeoutMs: number = 10000) => {
  return Promise.race([
    pool.query(query, params),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
    )
  ]);
};

export class MessageService {
  // Get messages for a request
  static async getMessages(requestId: string, userId: string): Promise<Message[]> {
    // Verify user is part of the request
    const request = await BookRequestService.getRequestById(requestId, userId);
    if (!request) {
      throw { error: { code: ERROR_CODES.FORBIDDEN_NOT_PARTY, message: 'You are not part of this request' } };
    }
    
    const query = `
      SELECT id, request_id, sender_id, body, created_at
      FROM messages
      WHERE request_id = $1
      ORDER BY created_at ASC
    `;
    
    const result = await queryWithTimeout(query, [requestId]) as any;
    return result.rows.map(this.transformDatabaseMessage);
  }

  // Create a new message
  static async createMessage(requestId: string, senderId: string, messageData: CreateMessageRequest): Promise<Message> {
    // Verify user is part of the request
    const request = await BookRequestService.getRequestById(requestId, senderId);
    if (!request) {
      throw { error: { code: ERROR_CODES.FORBIDDEN_NOT_PARTY, message: 'You are not part of this request' } };
    }
    
    const { body } = messageData;
    
    const query = `
      INSERT INTO messages (request_id, sender_id, body)
      VALUES ($1, $2, $3)
      RETURNING id, request_id, sender_id, body, created_at
    `;
    
    const result = await queryWithTimeout(query, [requestId, senderId, body]) as any;
    const dbMessage = result.rows[0];
    
    return this.transformDatabaseMessage(dbMessage);
  }

  // Transform database message to API message
  private static transformDatabaseMessage(dbMessage: DatabaseMessage): Message {
    return {
      id: dbMessage.id,
      requestId: dbMessage.request_id,
      senderId: dbMessage.sender_id,
      body: dbMessage.body,
      createdAt: dbMessage.created_at.toISOString()
    };
  }
}
