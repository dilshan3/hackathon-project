import { Router, Request, Response } from 'express';
import { BookRequestService } from '@/services/bookRequestService';
import { sendSuccess } from '@/utils/response';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/counters - Get counters for header badges
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const result = await BookRequestService.getCounters(req.user.userId);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

export default router;
