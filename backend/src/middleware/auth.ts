import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '@/utils/auth';
import { sendUnauthorized } from '@/utils/response';
import { JWTPayload } from '@/types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      sendUnauthorized(res, 'Access token required');
      return;
    }
    
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    sendUnauthorized(res, 'Invalid or expired token');
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
}
