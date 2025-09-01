import { Router, Request, Response } from 'express';
import { BookRequestService } from '@/services/bookRequestService';
import { validateRequest, createBookRequestSchema } from '@/utils/validation';
import { sendCreated, sendSuccess } from '@/utils/response';
import { authenticateToken } from '@/middleware/auth';
import { CreateBookRequestRequest } from '@/types';
import { PAGINATION } from '@/config/constants';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/requests - Create a new book request
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const requestData = validateRequest<CreateBookRequestRequest>(createBookRequestSchema, req.body);
    const result = await BookRequestService.createRequest(req.user.userId, requestData);
    sendCreated(res, result);
  } catch (error) {
    throw error;
  }
});

// GET /api/requests - Get requests for user (as owner or requester)
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const role = req.query.role as 'owner' | 'requester';
    if (!role || !['owner', 'requester'].includes(role)) {
      throw { error: { code: 'VALIDATION_ERROR', message: 'Role parameter is required and must be "owner" or "requester"' } };
    }
    
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const pageSize = Math.min(
      parseInt(req.query.pageSize as string) || PAGINATION.DEFAULT_PAGE_SIZE,
      PAGINATION.MAX_PAGE_SIZE
    );
    
    const result = await BookRequestService.getRequests(req.user.userId, role, status, page, pageSize);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

// GET /api/requests/:id - Get request by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const { id } = req.params;
    if (!id) {
      throw { error: { code: 'VALIDATION_ERROR', message: 'Request ID is required' } };
    }
    
    const request = await BookRequestService.getRequestById(id, req.user.userId);
    
    if (!request) {
      throw { error: { code: 'NOT_FOUND', message: 'Request not found' } };
    }
    
    sendSuccess(res, request);
  } catch (error) {
    throw error;
  }
});

// POST /api/requests/:id/approve - Approve request (owner only)
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const { id } = req.params;
    if (!id) {
      throw { error: { code: 'VALIDATION_ERROR', message: 'Request ID is required' } };
    }
    
    const result = await BookRequestService.approveRequest(id, req.user.userId);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

// POST /api/requests/:id/decline - Decline request (owner only)
router.post('/:id/decline', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const { id } = req.params;
    if (!id) {
      throw { error: { code: 'VALIDATION_ERROR', message: 'Request ID is required' } };
    }
    
    const result = await BookRequestService.declineRequest(id, req.user.userId);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

// POST /api/requests/:id/complete - Complete request (owner or requester)
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const { id } = req.params;
    if (!id) {
      throw { error: { code: 'VALIDATION_ERROR', message: 'Request ID is required' } };
    }
    
    const result = await BookRequestService.completeRequest(id, req.user.userId);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

export default router;
