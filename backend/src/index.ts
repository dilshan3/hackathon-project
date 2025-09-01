import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { APP_CONFIG, getCorsOrigins } from '@/config/constants';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';

// Import routes
import authRoutes from '@/routes/auth';
import meRoutes from '@/routes/me';
import healthRoutes from '@/routes/health';
import bookRoutes from '@/routes/books';
import requestRoutes from '@/routes/requests';
import counterRoutes from '@/routes/counters';
import messageRoutes from '@/routes/messages';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: getCorsOrigins(),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: APP_CONFIG.RATE_LIMIT_WINDOW_MS,
  max: APP_CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (APP_CONFIG.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check route (no rate limiting)
app.use('/healthz', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/counters', counterRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use('*', notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = APP_CONFIG.PORT;
app.listen(PORT, () => {
  console.log(`🚀 ReadLoop Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${APP_CONFIG.NODE_ENV}`);
  console.log(`🔗 CORS Origins: ${JSON.stringify(getCorsOrigins())}`);
  console.log(`⏰ Rate Limit: ${APP_CONFIG.RATE_LIMIT_MAX_REQUESTS} requests per ${APP_CONFIG.RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
