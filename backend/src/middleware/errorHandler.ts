import { Request, Response, NextFunction } from 'express';
import { sendInternalError, sendValidationError } from '@/utils/response';
import { ApiError } from '@/types';

export function errorHandler(
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);
  
  // Handle validation errors
  if ('error' in error && error.error.code === 'VALIDATION_ERROR') {
    sendValidationError(res, error.error.message, error.error.details);
    return;
  }
  
  // Handle JWT errors
  if ('message' in error && (error.message === 'Invalid token' || error.message === 'jwt malformed')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      }
    });
    return;
  }
  
  // Handle database errors
  if ('message' in error && (error.message.includes('duplicate key') || error.message.includes('unique constraint'))) {
    res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Resource already exists'
      }
    });
    return;
  }
  
  // Default error response
  sendInternalError(res, 'An unexpected error occurred');
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
}
