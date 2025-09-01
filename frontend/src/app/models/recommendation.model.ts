import { Book } from './book.model';

export type RecommendationRequest = {
  userId: string;
  city: string;
  preferences?: {
    genres?: string[];
    authors?: string[];
    readingGoals?: "entertainment" | "learning" | "research";
    bookLength?: "short" | "medium" | "long";
  };
  excludeBookIds?: string[];
  maxResults?: number; // Default: 10
};

export type BookRecommendation = {
  book: Book; // Book with owner populated
  score: number; // 0-1 relevance score
  reason: string; // AI-generated explanation
  matchFactors: string[]; // ["genre", "author", "rating"]
};

export type RecommendationsResponse = {
  recommendations: BookRecommendation[];
  totalAvailable: number;
  generatedAt: string;
  preferences: {
    genres?: string[];
    authors?: string[];
    readingGoals?: string;
    bookLength?: string;
  };
};

export type UserPreferences = {
  genres?: string[];
  authors?: string[];
  readingGoals?: "entertainment" | "learning" | "research";
  bookLength?: "short" | "medium" | "long";
  userId: string;
  updatedAt?: string;
};

export type RecommendationHistory = {
  id: string;
  generatedAt: string;
  preferences: UserPreferences;
  recommendations: BookRecommendation[];
  liked?: string[]; // book IDs that were liked
  disliked?: string[]; // book IDs that were disliked
};

export type RecommendationFeedback = {
  bookId: string;
  liked: boolean;
  reason?: string;
};
