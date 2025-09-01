import { Router, Request, Response } from 'express';
import { sendHealthCheck } from '@/utils/response';

const router = Router();

// GET /healthz
router.get('/', (req: Request, res: Response) => {
  sendHealthCheck(res);
});

export default router;
