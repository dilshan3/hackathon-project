import { Response } from 'express';
import { HTTP_STATUS, ERROR_CODES } from '@/config/constants';
import { ApiError } from '@/types';

// Success response helpers
export function sendSuccess<T>(res: Response, data: T, statusCode: number = HTTP_STATUS.OK): void {
  res.status(statusCode).json(data);
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, HTTP_STATUS.CREATED);
}

export function sendNoContent(res: Response): void {
  res.status(HTTP_STATUS.NO_CONTENT).send();
}

// Error response helpers
export function sendError(
  res: Response, 
  code: string, 
  message: string, 
  statusCode: number = HTTP_STATUS.BAD_REQUEST,
  details?: Record<string, any>
): void {
  const error: ApiError = {
    error: {
      code,
      message,
      details: details || undefined
    }
  };
  
  res.status(statusCode).json(error);
}

export function sendValidationError(res: Response, message: string, details?: Record<string, any>): void {
  sendError(res, ERROR_CODES.VALIDATION_ERROR, message, HTTP_STATUS.BAD_REQUEST, details);
}

export function sendUnauthorized(res: Response, message: string = 'Unauthorized'): void {
  sendError(res, ERROR_CODES.UNAUTHORIZED, message, HTTP_STATUS.UNAUTHORIZED);
}

export function sendForbidden(res: Response, message: string = 'Forbidden'): void {
  sendError(res, ERROR_CODES.FORBIDDEN, message, HTTP_STATUS.FORBIDDEN);
}

export function sendNotFound(res: Response, message: string = 'Resource not found'): void {
  sendError(res, ERROR_CODES.NOT_FOUND, message, HTTP_STATUS.NOT_FOUND);
}

export function sendConflict(res: Response, code: string, message: string): void {
  sendError(res, code, message, HTTP_STATUS.CONFLICT);
}

export function sendInternalError(res: Response, message: string = 'Internal server error'): void {
  sendError(res, ERROR_CODES.INTERNAL_ERROR, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}

// Pagination helper
export function createPagedResponse<T>(
  items: T[], 
  total: number, 
  page: number, 
  pageSize: number
) {
  return {
    items,
    total,
    page,
    pageSize
  };
}

// Health check response
export function sendHealthCheck(res: Response): void {
  sendSuccess(res, {
    status: 'ok',
    time: new Date().toISOString()
  });
}
