import { Router, Request, Response } from 'express';
import { UserService } from '@/services/userService';
import { validateRequest, registerSchema, loginSchema } from '@/utils/validation';
import { sendCreated, sendSuccess } from '@/utils/response';
import { RegisterRequest, LoginRequest } from '@/types';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    console.log('Register endpoint hit:', { email: req.body?.email });
    const userData = validateRequest<RegisterRequest>(registerSchema, req.body);
    console.log('Validation passed, creating user...');
    const result = await UserService.createUser(userData);
    console.log('User created successfully');
    sendCreated(res, result);
  } catch (error) {
    console.error('Register endpoint error:', error);
    // Error handling is done by the error handler middleware
    throw error;
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const credentials = validateRequest<LoginRequest>(loginSchema, req.body);
    const result = await UserService.authenticateUser(credentials);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

export default router;
