import { Router, Request, Response } from 'express';
import { BookService } from '@/services/bookService';
import { validateRequest, createBookSchema, updateBookSchema } from '@/utils/validation';
import { sendCreated, sendSuccess, sendNoContent } from '@/utils/response';
import { authenticateToken } from '@/middleware/auth';
import { CreateBookRequest, UpdateBookRequest } from '@/types';
import { PAGINATION } from '@/config/constants';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/books - Create a new book
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const bookData = validateRequest<CreateBookRequest>(createBookSchema, req.body);
    const result = await BookService.createBook(req.user.userId, bookData);
    sendCreated(res, result);
  } catch (error) {
    throw error;
  }
});

// GET /api/books/mine - Get user's own books
router.get('/mine', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const pageSize = Math.min(
      parseInt(req.query.pageSize as string) || PAGINATION.DEFAULT_PAGE_SIZE,
      PAGINATION.MAX_PAGE_SIZE
    );
    
    const result = await BookService.getMyBooks(req.user.userId, page, pageSize);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

// GET /api/books - Search and discover books (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const city = req.query.city as string;
    const status = (req.query.status as string) || 'AVAILABLE';
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const pageSize = Math.min(
      parseInt(req.query.pageSize as string) || PAGINATION.DEFAULT_PAGE_SIZE,
      PAGINATION.MAX_PAGE_SIZE
    );
    
    const result = await BookService.searchBooks(query, city, status, page, pageSize);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

// GET /api/books/:id - Get book by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw { error: { code: 'VALIDATION_ERROR', message: 'Book ID is required' } };
    }
    
    const book = await BookService.getBookById(id);
    
    if (!book) {
      throw { error: { code: 'NOT_FOUND', message: 'Book not found' } };
    }
    
    sendSuccess(res, book);
  } catch (error) {
    throw error;
  }
});

// PUT /api/books/:id - Update book (owner only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const { id } = req.params;
    if (!id) {
      throw { error: { code: 'VALIDATION_ERROR', message: 'Book ID is required' } };
    }
    
    const updates = validateRequest<UpdateBookRequest>(updateBookSchema, req.body);
    const result = await BookService.updateBook(id, req.user.userId, updates);
    sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
});

// DELETE /api/books/:id - Delete book (owner only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    
    const { id } = req.params;
    if (!id) {
      throw { error: { code: 'VALIDATION_ERROR', message: 'Book ID is required' } };
    }
    
    await BookService.deleteBook(id, req.user.userId);
    sendNoContent(res);
  } catch (error) {
    throw error;
  }
});

export default router;
