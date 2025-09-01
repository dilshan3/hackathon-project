import { Book } from './book.model';
import { User } from './user.model';

export type RequestStatus = "PENDING" | "APPROVED" | "DECLINED" | "COMPLETED";

export interface BookRequest {
  id: string;
  bookId: string;
  requesterId: string;
  ownerId: string;
  status: RequestStatus;
  note?: string;
  startDate?: string; // yyyy-mm-dd
  durationDays?: number; // > 0
  createdAt: string;
  updatedAt: string;
  book?: Pick<Book, "id" | "title" | "author">;
  requester?: Pick<User, "id" | "displayName" | "city">;
  owner?: Pick<User, "id" | "displayName" | "city">;
}

export interface CreateRequestRequest {
  bookId: string;
  startDate: string;
  durationDays: number;
  note?: string;
}
