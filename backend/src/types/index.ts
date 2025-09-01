// Auth Types
export interface AuthToken {
  token: string;
  expiresIn?: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  city?: string | undefined;
  createdAt: string;
}

export interface Me extends User {
  emailVerified: boolean;
}

// Book Types
export type BookCondition = "NEW" | "GOOD" | "FAIR" | "POOR";
export type BookStatus = "AVAILABLE" | "LENT" | "NOT_AVAILABLE";

export interface Book {
  id: string;
  ownerId: string;
  title: string;
  author?: string | undefined;
  genre?: string | undefined;
  condition: BookCondition;
  status: BookStatus;
  createdAt: string;
  owner?: Pick<User, "id" | "displayName" | "city"> | undefined;
}

// Request Types
export type RequestStatus = "PENDING" | "APPROVED" | "DECLINED" | "COMPLETED";

export interface BookRequest {
  id: string;
  bookId: string;
  requesterId: string;
  ownerId: string;
  status: RequestStatus;
  note?: string | undefined;
  startDate?: string | undefined;
  durationDays?: number | undefined;
  createdAt: string;
  updatedAt: string;
  book?: Pick<Book, "id" | "title" | "author" | "condition"> | undefined;
  requester?: Pick<User, "id" | "displayName" | "city"> | undefined;
  owner?: Pick<User, "id" | "displayName" | "city"> | undefined;
}

// Pagination Types
export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Counter Types
export interface Counters {
  incomingPendingRequests: number;
  myActiveRequests: number;
}

// Message Types
export interface Message {
  id: string;
  requestId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

// Request/Response Types
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  city?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  city?: string;
}

export interface CreateBookRequest {
  title: string;
  author?: string;
  genre?: string;
  condition: BookCondition;
  status: BookStatus;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  genre?: string;
  condition?: BookCondition;
  status?: BookStatus;
}

export interface CreateBookRequestRequest {
  bookId: string;
  startDate?: string;
  durationDays?: number;
  note?: string;
}

export interface CreateMessageRequest {
  body: string;
}

// Error Types
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any> | undefined;
  };
}

// Database Types
export interface DatabaseUser {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  city?: string;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseBook {
  id: string;
  owner_id: string;
  title: string;
  author?: string;
  genre?: string;
  condition: BookCondition;
  status: BookStatus;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseBookRequest {
  id: string;
  book_id: string;
  requester_id: string;
  owner_id: string;
  status: RequestStatus;
  note?: string;
  start_date?: Date;
  duration_days?: number;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseMessage {
  id: string;
  request_id: string;
  sender_id: string;
  body: string;
  created_at: Date;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
