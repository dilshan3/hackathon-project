export type BookCondition = "NEW" | "GOOD" | "FAIR" | "POOR";

export type BookStatus = "AVAILABLE" | "LENT" | "NOT_AVAILABLE";

export interface Book {
  id: string;
  ownerId: string;
  title: string;
  author?: string;
  genre?: string;
  condition: BookCondition;
  status: BookStatus;
  createdAt: string;
  owner?: Pick<import('./user.model').User, "id" | "displayName" | "city">;
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
