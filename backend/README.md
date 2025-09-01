# ReadLoop Backend

A modern, scalable backend for the ReadLoop community book sharing platform built with Node.js, TypeScript, and Neon PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with secure password hashing
- **User Management**: Registration, login, and profile management
- **Database**: Neon PostgreSQL with optimized queries and indexing
- **Security**: Helmet, CORS, rate limiting, and input validation
- **TypeScript**: Full type safety across the application
- **Vercel Ready**: Optimized for serverless deployment on Vercel
- **API Documentation**: OpenAPI/Swagger ready endpoints

## 🛠 Tech Stack

- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js with TypeScript
- **Database**: Neon (Serverless PostgreSQL)
- **Authentication**: JWT with bcryptjs
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, rate limiting
- **Deployment**: Vercel serverless functions

## 📋 Prerequisites

- Node.js 18+ LTS
- npm or yarn
- Neon PostgreSQL database
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Update `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
```

### 3. Database Setup

Run the database schema to create tables:

```bash
# Connect to your Neon database and run:
psql $DATABASE_URL -f src/database/schema.sql
```

### 4. Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 5. Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

### MVP 0 - Foundations

#### Authentication

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "displayName": "John Doe",
  "city": "Colombo"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

#### User Profile

**GET /api/me**
- Requires: Bearer JWT token
- Returns: User profile with email verification status

**PUT /api/me**
- Requires: Bearer JWT token
- Body: `{ "displayName": "New Name", "city": "New City" }`

#### Health Check

**GET /healthz**
- Returns: `{ "status": "ok", "time": "2025-09-01T09:10:00Z" }`

## 🔧 Development

### Project Structure

```
src/
├── config/          # Configuration files
├── database/        # Database schema and migrations
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Neon PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:4200` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment**: Set environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy on push

### Environment Variables for Production

Set these in your Vercel project settings:

```env
NODE_ENV=production
DATABASE_URL=your-neon-production-url
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Build Configuration

The `vercel.json` file is configured for optimal serverless deployment:

- Builds from `dist/index.js`
- Routes all requests to the main function
- Sets appropriate function timeout

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with configurable rounds
- **Input Validation**: Joi schema validation for all inputs
- **Rate Limiting**: Configurable rate limiting per IP
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization and validation

## 📊 Performance

- **Database Optimization**: Indexed queries and efficient schemas
- **Connection Pooling**: Optimized database connections
- **Compression**: Response compression for faster loading
- **Caching Ready**: Structure supports Redis caching
- **Serverless Ready**: Optimized for Vercel's serverless environment

## 🧪 Testing

### Test Structure

```
src/
├── __tests__/
│   ├── setup.ts           # Test configuration
│   ├── auth.test.ts       # Authentication tests
│   ├── user.test.ts       # User service tests
│   └── integration.test.ts # Integration tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

## 🔄 API Versioning

The API follows semantic versioning and maintains backward compatibility within major versions. All endpoints are prefixed with `/api/` for future versioning support.

## 📝 Error Handling

All API responses follow a consistent error format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { "field": "specific error details" }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the API documentation
- Review the error logs and debugging information

## 🔮 Roadmap

- [ ] MVP 1: Book management and requests
- [ ] MVP 1.1: Messaging and notifications
- [ ] AI-powered recommendations
- [ ] Community features
- [ ] Mobile app support
- [ ] Advanced analytics
