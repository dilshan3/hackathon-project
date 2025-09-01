import { Router, Request, Response } from 'express';
import { MessageService } from '@/services/messageService';
import { validateRequest, createMessageSchema } from '@/utils/validation';
import { sendCreated, sendSuccess } from '@/utils/response';
import { authenticateToken } from '@/middleware/auth';
import { CreateMessageRequest } from '@/types';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/requests/:id/messages - Get messages for a request
router.get('/:requestId', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const { requestId } = req.params;
    if (!requestId) {
      throw { error: { code: 'VALIDATION_ERROR', message: 'Request ID is required' } };
    }
    
    const messages = await MessageService.getMessages(requestId, req.user.userId);
    sendSuccess(res, { items: messages });
  } catch (error) {
    throw error;
  }
});

// POST /api/requests/:id/messages - Create a new message
router.post('/:requestId', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const { requestId } = req.params;
    if (!requestId) {
      throw { error: { code: 'VALIDATION_ERROR', message: 'Request ID is required' } };
    }
    
    const messageData = validateRequest<CreateMessageRequest>(createMessageSchema, req.body);
    const result = await MessageService.createMessage(requestId, req.user.userId, messageData);
    sendCreated(res, result);
  } catch (error) {
    throw error;
  }
});

export default router;
