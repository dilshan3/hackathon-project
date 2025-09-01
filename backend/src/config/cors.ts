import { CorsOptions } from 'cors';
import { APP_CONFIG } from './constants';

// Advanced CORS configuration with dynamic origin checking
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = APP_CONFIG.CORS_ORIGIN.includes(',') 
      ? APP_CONFIG.CORS_ORIGIN.split(',').map(o => o.trim())
      : [APP_CONFIG.CORS_ORIGIN];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check for wildcard patterns (*.domain.com)
    const wildcardMatch = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return false;
    });

    if (wildcardMatch) {
      return callback(null, true);
    }

    // Reject origin
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};
