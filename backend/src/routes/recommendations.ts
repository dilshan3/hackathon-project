import { Router, Request, Response } from 'express';
import { RecommendationService } from '@/services/recommendationService';
import { 
  validateRequest, 
  updateReadingPreferencesSchema, 
  submitFeedbackSchema, 
  getRecommendationsSchema 
} from '@/utils/validation';
import { sendSuccess } from '@/utils/response';
import { authenticateToken } from '@/middleware/auth';
import { 
  UpdateReadingPreferencesRequest, 
  SubmitFeedbackRequest,
  RecommendationRequest 
} from '@/types';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/recommendations - Get book recommendations
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }

    const queryParams = validateRequest(getRecommendationsSchema, req.body);
    
    const recommendationRequest: RecommendationRequest = {
      userId: req.user.userId,
      limit: (queryParams as any).limit || 10,
      excludeOwned: (queryParams as any).excludeOwned !== false, // Default to true
      genres: (queryParams as any).genres,
      minScore: (queryParams as any).minScore || 0
    };

    const recommendations = await RecommendationService.getRecommendations(recommendationRequest);
    sendSuccess(res, { recommendations });
  } catch (error) {
    throw error;
  }
});

// POST /api/recommendations/generate - Generate new recommendations
router.post('/generate', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }

    await RecommendationService.generateRecommendations(req.user.userId);
    sendSuccess(res, { message: 'Recommendations generated successfully' });
  } catch (error) {
    throw error;
  }
});

// GET /api/recommendations/preferences - Get user reading preferences
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const preferences = await RecommendationService.getUserReadingPreferences(req.user.userId);
    sendSuccess(res, preferences);
  } catch (error) {
    throw error;
  }
});

// PUT /api/recommendations/preferences - Update user reading preferences
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const updates = validateRequest<UpdateReadingPreferencesRequest>(updateReadingPreferencesSchema, req.body);
    const result = await RecommendationService.updateUserReadingPreferences(req.user.userId, updates);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

// POST /api/recommendations/feedback - Submit recommendation feedback
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const feedbackData = validateRequest<SubmitFeedbackRequest>(submitFeedbackSchema, req.body);
    const result = await RecommendationService.submitFeedback(req.user.userId, feedbackData);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

// GET /api/recommendations/genres - Get available genres
router.get('/genres', async (req: Request, res: Response) => {
  try {
    const genres = await RecommendationService.getAvailableGenres();
    sendSuccess(res, genres);
  } catch (error) {
    throw error;
  }
});

// GET /api/recommendations/authors/search - Search authors
router.get('/authors/search', async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!searchTerm || searchTerm.length < 2) {
      sendSuccess(res, []);
      return;
    }
    
    const authors = await RecommendationService.searchAuthors(searchTerm, limit);
    sendSuccess(res, authors);
  } catch (error) {
    throw error;
  }
});

export default router;
