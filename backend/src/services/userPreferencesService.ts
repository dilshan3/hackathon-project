import pool from '@/config/database';
import { UserPreferences, DatabaseUserPreferences, UpdateUserPreferencesRequest } from '@/types';
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

export class UserPreferencesService {
  // Get user preferences
  static async getUserPreferences(userId: string): Promise<UserPreferences> {
    const query = `
      SELECT user_id, email_notifications, push_notifications, notification_frequency, created_at, updated_at
      FROM user_preferences
      WHERE user_id = $1
    `;
    
    const result = await queryWithTimeout(query, [userId]) as any;
    
    if (result.rows.length === 0) {
      // Create default preferences if none exist
      return this.createDefaultPreferences(userId);
    }
    
    return this.transformDatabasePreferences(result.rows[0]);
  }

  // Update user preferences
  static async updateUserPreferences(
    userId: string, 
    updates: UpdateUserPreferencesRequest
  ): Promise<UserPreferences> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (updates.emailNotifications !== undefined) {
      setClause.push(`email_notifications = $${paramCount++}`);
      values.push(updates.emailNotifications);
    }
    
    if (updates.pushNotifications !== undefined) {
      setClause.push(`push_notifications = $${paramCount++}`);
      values.push(updates.pushNotifications);
    }
    
    if (updates.notificationFrequency !== undefined) {
      setClause.push(`notification_frequency = $${paramCount++}`);
      values.push(updates.notificationFrequency);
    }
    
    if (setClause.length === 0) {
      throw { error: { code: ERROR_CODES.VALIDATION_ERROR, message: 'No fields to update' } };
    }
    
    values.push(userId);
    
    const query = `
      UPDATE user_preferences 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramCount}
      RETURNING user_id, email_notifications, push_notifications, notification_frequency, created_at, updated_at
    `;
    
    const result = await queryWithTimeout(query, values) as any;
    
    if (result.rows.length === 0) {
      // Create preferences if they don't exist
      return this.createDefaultPreferences(userId);
    }
    
    return this.transformDatabasePreferences(result.rows[0]);
  }

  // Create default preferences for a user
  static async createDefaultPreferences(userId: string): Promise<UserPreferences> {
    const query = `
      INSERT INTO user_preferences (user_id, email_notifications, push_notifications, notification_frequency)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, email_notifications, push_notifications, notification_frequency, created_at, updated_at
    `;
    
    const result = await queryWithTimeout(query, [userId, true, true, 'IMMEDIATE']) as any;
    return this.transformDatabasePreferences(result.rows[0]);
  }

  // Check if user wants email notifications
  static async shouldSendEmailNotification(userId: string): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId);
    return preferences.emailNotifications;
  }

  // Transform database preferences to API preferences
  private static transformDatabasePreferences(dbPrefs: DatabaseUserPreferences): UserPreferences {
    return {
      userId: dbPrefs.user_id,
      emailNotifications: dbPrefs.email_notifications,
      pushNotifications: dbPrefs.push_notifications,
      notificationFrequency: dbPrefs.notification_frequency as 'IMMEDIATE' | 'DAILY' | 'WEEKLY',
      createdAt: dbPrefs.created_at.toISOString(),
      updatedAt: dbPrefs.updated_at.toISOString()
    };
  }
}
