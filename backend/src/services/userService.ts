import pool from '@/config/database';
import { hashPassword, comparePassword, generateToken } from '@/utils/auth';
import { DatabaseUser, User, Me, RegisterRequest, LoginRequest, UpdateProfileRequest } from '@/types';
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

export class UserService {
  // Create a new user
  static async createUser(userData: RegisterRequest): Promise<{ token: string; user: User }> {
    const { email, password, displayName, city } = userData;
    
    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw { error: { code: ERROR_CODES.EMAIL_TAKEN, message: 'Email already taken' } };
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Insert user
    const query = `
      INSERT INTO users (email, password_hash, display_name, city)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, display_name, city, email_verified, created_at
    `;
    
    const result = await queryWithTimeout(query, [email, passwordHash, displayName, city]) as any;
    const dbUser = result.rows[0];
    
    // Generate token
    const token = generateToken({
      userId: dbUser.id,
      email: dbUser.email
    });
    
    // Transform to API response
    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.display_name,
      city: dbUser.city,
      createdAt: dbUser.created_at.toISOString()
    };
    
    return { token, user };
  }
  
  // Authenticate user
  static async authenticateUser(credentials: LoginRequest): Promise<{ token: string; user: User }> {
    const { email, password } = credentials;
    
    // Find user by email
    const user = await this.findByEmail(email);
    if (!user) {
      throw { error: { code: ERROR_CODES.INVALID_CREDENTIALS, message: 'Invalid credentials' } };
    }
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw { error: { code: ERROR_CODES.INVALID_CREDENTIALS, message: 'Invalid credentials' } };
    }
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });
    
    // Transform to API response
    const userResponse: User = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      city: user.city || undefined,
      createdAt: user.created_at.toISOString()
    };
    
    return { token, user: userResponse };
  }
  
  // Get user by ID
  static async findById(id: string): Promise<Me | null> {
    const query = `
      SELECT id, email, display_name, city, email_verified, created_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await queryWithTimeout(query, [id]) as any;
    if (result.rows.length === 0) {
      return null;
    }
    
    const dbUser = result.rows[0];
    return {
      id: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.display_name,
      city: dbUser.city,
      emailVerified: dbUser.email_verified,
      createdAt: dbUser.created_at.toISOString()
    };
  }
  
  // Update user profile
  static async updateProfile(id: string, updates: UpdateProfileRequest): Promise<Me> {
    const { displayName, city } = updates;
    
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (displayName !== undefined) {
      setClause.push(`display_name = $${paramCount++}`);
      values.push(displayName);
    }
    
    if (city !== undefined) {
      setClause.push(`city = $${paramCount++}`);
      values.push(city);
    }
    
    if (setClause.length === 0) {
      throw { error: { code: ERROR_CODES.VALIDATION_ERROR, message: 'No fields to update' } };
    }
    
    values.push(id);
    
    const query = `
      UPDATE users
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, display_name, city, email_verified, created_at
    `;
    
    const result = await queryWithTimeout(query, values) as any;
    if (result.rows.length === 0) {
      throw { error: { code: ERROR_CODES.NOT_FOUND, message: 'User not found' } };
    }
    
    const dbUser = result.rows[0];
    return {
      id: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.display_name,
      city: dbUser.city,
      emailVerified: dbUser.email_verified,
      createdAt: dbUser.created_at.toISOString()
    };
  }
  
  // Find user by email (internal use)
  private static async findByEmail(email: string): Promise<DatabaseUser | null> {
    const query = `
      SELECT id, email, password_hash, display_name, city, email_verified, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    const result = await queryWithTimeout(query, [email]) as any;
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }
  
  // Get user for book/request responses (minimal profile)
  static async getMinimalProfile(id: string): Promise<Pick<User, 'id' | 'displayName' | 'city'> | null> {
    const query = `
      SELECT id, display_name, city
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    
    const dbUser = result.rows[0];
    return {
      id: dbUser.id,
      displayName: dbUser.display_name,
      city: dbUser.city
    };
  }
}
