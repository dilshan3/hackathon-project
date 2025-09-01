import Joi from 'joi';
import { ERROR_CODES } from '@/config/constants';
import { ApiError } from '@/types';

// Validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'string.min': 'Password must be at least 8 characters long'
    }),
  displayName: Joi.string().min(2).max(255).required(),
  city: Joi.string().max(255).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(2).max(255).optional(),
  city: Joi.string().max(255).optional()
}).min(1);

// Book validation schemas
export const createBookSchema = Joi.object({
  title: Joi.string().min(1).max(500).required(),
  author: Joi.string().max(255).optional(),
  genre: Joi.string().max(100).optional(),
  condition: Joi.string().valid('NEW', 'GOOD', 'FAIR', 'POOR').default('GOOD'),
  status: Joi.string().valid('AVAILABLE', 'LENT', 'NOT_AVAILABLE').default('AVAILABLE')
});

export const updateBookSchema = Joi.object({
  title: Joi.string().min(1).max(500).optional(),
  author: Joi.string().max(255).optional(),
  genre: Joi.string().max(100).optional(),
  condition: Joi.string().valid('NEW', 'GOOD', 'FAIR', 'POOR').optional(),
  status: Joi.string().valid('AVAILABLE', 'LENT', 'NOT_AVAILABLE').optional()
}).min(1);

// Book request validation schemas
export const createBookRequestSchema = Joi.object({
  bookId: Joi.string().uuid().required(),
  startDate: Joi.date().iso().optional(),
  durationDays: Joi.number().integer().min(1).max(365).optional(),
  note: Joi.string().max(1000).optional()
});

// Message validation schema
export const createMessageSchema = Joi.object({
  body: Joi.string().min(1).max(1000).required()
});

// MVP 1.1 Validation Schemas
export const updateUserPreferencesSchema = Joi.object({
  emailNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
  notificationFrequency: Joi.string().valid('IMMEDIATE', 'DAILY', 'WEEKLY').optional()
}).min(1);

// AI Recommendation Validation Schemas
export const updateReadingPreferencesSchema = Joi.object({
  genres: Joi.array().items(Joi.string()).optional(),
  authors: Joi.array().items(Joi.string()).optional(),
  readingGoals: Joi.string().optional(),
  bookLength: Joi.string().optional()
}).min(1);

export const submitFeedbackSchema = Joi.object({
  bookId: Joi.string().uuid().required(),
  liked: Joi.boolean().required(),
  reason: Joi.string().optional()
});

export const getRecommendationsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10),
  excludeOwned: Joi.boolean().default(true),
  genres: Joi.array().items(Joi.string()).optional(),
  minScore: Joi.number().min(0).max(1).default(0)
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20)
});

export const bookSearchSchema = Joi.object({
  query: Joi.string().max(255).optional(),
  city: Joi.string().max(255).optional(),
  status: Joi.string().valid('AVAILABLE', 'LENT', 'NOT_AVAILABLE').default('AVAILABLE'),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20)
});

export const requestListSchema = Joi.object({
  role: Joi.string().valid('owner', 'requester').required(),
  status: Joi.string().valid('PENDING', 'APPROVED', 'DECLINED', 'COMPLETED').optional(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20)
});

// Validation helper function
export function validateRequest<T>(schema: Joi.ObjectSchema, data: any): T {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const details = error.details.reduce((acc, detail) => {
      if (detail.path[0] !== undefined) {
        acc[detail.path[0]] = detail.message;
      }
      return acc;
    }, {} as Record<string, string>);

    const apiError: ApiError = {
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details
      }
    };
    
    throw apiError;
  }
  
  return value as T;
}

// UUID validation
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
