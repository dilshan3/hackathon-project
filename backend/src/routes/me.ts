import { Router, Request, Response } from 'express';
import { UserService } from '@/services/userService';
import { validateRequest, updateProfileSchema } from '@/utils/validation';
import { sendSuccess } from '@/utils/response';
import { authenticateToken } from '@/middleware/auth';
import { UpdateProfileRequest } from '@/types';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/me
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    
    const user = await UserService.findById(req.user.userId);
    if (!user) {
      throw { error: { code: 'NOT_FOUND', message: 'User not found' } };
    }
    
    sendSuccess(res, user);
  } catch (error) {
    throw error;
  }
});

// PUT /api/me
router.put('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    
    const updates = validateRequest<UpdateProfileRequest>(updateProfileSchema, req.body);
    const updatedUser = await UserService.updateProfile(req.user.userId, updates);
    
    sendSuccess(res, updatedUser);
  } catch (error) {
    throw error;
  }
});

export default router;
