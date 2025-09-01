import { Router, Request, Response } from 'express';
import { UserPreferencesService } from '@/services/userPreferencesService';
import { validateRequest, updateUserPreferencesSchema } from '@/utils/validation';
import { sendSuccess } from '@/utils/response';
import { authenticateToken } from '@/middleware/auth';
import { UpdateUserPreferencesRequest } from '@/types';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/preferences - Get user preferences
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const preferences = await UserPreferencesService.getUserPreferences(req.user.userId);
    sendSuccess(res, preferences);
  } catch (error) {
    throw error;
  }
});

// PUT /api/preferences - Update user preferences
router.put('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const updates = validateRequest<UpdateUserPreferencesRequest>(updateUserPreferencesSchema, req.body);
    const result = await UserPreferencesService.updateUserPreferences(req.user.userId, updates);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

export default router;
