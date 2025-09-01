import pool from '@/config/database';
import { EmailNotification, DatabaseEmailNotification } from '@/types';
import { UserPreferencesService } from './userPreferencesService';

// Helper function to execute queries with timeout
const queryWithTimeout = async (query: string, params: any[], timeoutMs: number = 10000) => {
  return Promise.race([
    pool.query(query, params),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
    )
  ]);
};

export class EmailNotificationService {
  // Create a new email notification
  static async createNotification(
    userId: string,
    type: string,
    subject: string,
    body: string
  ): Promise<EmailNotification> {
    const query = `
      INSERT INTO email_notifications (user_id, type, subject, body)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, type, subject, body, status, sent_at, created_at
    `;
    
    const result = await queryWithTimeout(query, [userId, type, subject, body]) as any;
    const dbNotification = result.rows[0];
    
    return this.transformDatabaseNotification(dbNotification);
  }

  // Mark notification as sent
  static async markAsSent(notificationId: string): Promise<void> {
    const query = `
      UPDATE email_notifications 
      SET status = 'SENT', sent_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await queryWithTimeout(query, [notificationId]);
  }

  // Mark notification as failed
  static async markAsFailed(notificationId: string): Promise<void> {
    const query = `
      UPDATE email_notifications 
      SET status = 'FAILED'
      WHERE id = $1
    `;
    
    await queryWithTimeout(query, [notificationId]);
  }

  // Get pending notifications
  static async getPendingNotifications(): Promise<EmailNotification[]> {
    const query = `
      SELECT id, user_id, type, subject, body, status, sent_at, created_at
      FROM email_notifications
      WHERE status = 'PENDING'
      ORDER BY created_at ASC
    `;
    
    const result = await queryWithTimeout(query, []) as any;
    return result.rows.map(this.transformDatabaseNotification);
  }

  // Get user's notification history
  static async getUserNotifications(
    userId: string,
    limit: number = 50
  ): Promise<EmailNotification[]> {
    const query = `
      SELECT id, user_id, type, subject, body, status, sent_at, created_at
      FROM email_notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await queryWithTimeout(query, [userId, limit]) as any;
    return result.rows.map(this.transformDatabaseNotification);
  }

  // Send notification for book request
  static async sendBookRequestNotification(
    userId: string,
    requestType: 'NEW_REQUEST' | 'REQUEST_APPROVED' | 'REQUEST_DECLINED' | 'REQUEST_COMPLETED',
    bookTitle: string,
    requesterName?: string
  ): Promise<void> {
    // Check if user wants email notifications
    const shouldSend = await UserPreferencesService.shouldSendEmailNotification(userId);
    if (!shouldSend) {
      return;
    }

    let subject: string;
    let body: string;

    switch (requestType) {
      case 'NEW_REQUEST':
        subject = `New Book Request: ${bookTitle}`;
        body = `You have received a new request to borrow "${bookTitle}" from ${requesterName || 'a user'}.`;
        break;
      case 'REQUEST_APPROVED':
        subject = `Book Request Approved: ${bookTitle}`;
        body = `Your request to borrow "${bookTitle}" has been approved!`;
        break;
      case 'REQUEST_DECLINED':
        subject = `Book Request Declined: ${bookTitle}`;
        body = `Your request to borrow "${bookTitle}" has been declined.`;
        break;
      case 'REQUEST_COMPLETED':
        subject = `Book Returned: ${bookTitle}`;
        body = `The book "${bookTitle}" has been returned. Thank you for using ReadLoop!`;
        break;
      default:
        return;
    }

    await this.createNotification(userId, requestType, subject, body);
  }

  // Send notification for new message
  static async sendMessageNotification(
    userId: string,
    bookTitle: string,
    senderName: string
  ): Promise<void> {
    // Check if user wants email notifications
    const shouldSend = await UserPreferencesService.shouldSendEmailNotification(userId);
    if (!shouldSend) {
      return;
    }

    const subject = `New Message: ${bookTitle}`;
    const body = `You have received a new message from ${senderName} regarding "${bookTitle}".`;

    await this.createNotification(userId, 'NEW_MESSAGE', subject, body);
  }

  // Transform database notification to API notification
  private static transformDatabaseNotification(dbNotification: DatabaseEmailNotification): EmailNotification {
    return {
      id: dbNotification.id,
      userId: dbNotification.user_id,
      type: dbNotification.type,
      subject: dbNotification.subject,
      body: dbNotification.body,
      status: dbNotification.status as 'PENDING' | 'SENT' | 'FAILED',
      sentAt: dbNotification.sent_at?.toISOString(),
      createdAt: dbNotification.created_at.toISOString()
    };
  }
}
