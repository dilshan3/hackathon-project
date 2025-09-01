# ReadLoop - Community Book Sharing Platform

A modern, community-driven book sharing and marketplace application that enables users to share, request, and trade books within local communities while promoting sustainable reading practices.

## 🚀 Project Status

### ✅ MVP 0 - Foundations (COMPLETED)
- **Backend**: Fully implemented with Node.js/TypeScript
- **Authentication**: JWT-based auth system
- **Database**: Neon PostgreSQL schema ready
- **API**: Core endpoints implemented
- **Security**: Comprehensive security measures
- **Deployment**: Vercel-ready configuration

### 🔄 MVP 1 - Core Share Loop (In Progress)
- Book management and discovery
- Request lifecycle management
- Search and filtering capabilities

### 📋 MVP 1.1 - Quality of Life (Planned)
- In-app messaging
- Email notifications
- Enhanced user experience

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js with TypeScript
- **Database**: Neon (Serverless PostgreSQL)
- **Authentication**: JWT + bcryptjs
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, rate limiting
- **Deployment**: Vercel serverless functions

### Frontend (Planned)
- **Framework**: Angular 17+
- **UI Library**: Angular Material
- **State Management**: NgRx
- **Testing**: Jasmine, Karma, Cypress

### DevOps
- **Version Control**: GitHub
- **CI/CD**: GitHub Actions
- **Database**: Neon PostgreSQL
- **Deployment**: Vercel

## 📁 Project Structure

```
hackathon-project/
├── backend/              # ✅ Node.js/TypeScript Backend
│   ├── src/             # Source code
│   ├── package.json     # Dependencies
│   ├── tsconfig.json    # TypeScript config
│   ├── vercel.json      # Vercel deployment
│   └── README.md        # Backend documentation
├── frontend/            # 🔄 Angular Frontend (Planned)
├── docs/               # 📚 Project documentation
└── ReadMe.md           # This file
```

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**:
   ```bash
   # Connect to your Neon database and run:
   psql $DATABASE_URL -f src/database/schema.sql
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Run tests**:
   ```bash
   npm test
   ```

### Frontend Setup (Coming Soon)

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

## 📚 API Documentation

### MVP 0 Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

#### User Profile
- `GET /api/me` - Get current user profile
- `PUT /api/me` - Update user profile

#### Health Check
- `GET /healthz` - Application health status

### API Response Format

#### Success Response
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "city": "Colombo",
  "createdAt": "2025-09-01T09:10:00Z"
}
```

#### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Email must be valid"
    }
  }
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 rounds
- **Input Validation**: Joi schema validation
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS Protection**: Configurable cross-origin requests
- **Security Headers**: Helmet middleware
- **SQL Injection Protection**: Parameterized queries

## 🚀 Deployment

### Backend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Frontend (Coming Soon)
1. Build Angular application
2. Deploy to Vercel or similar platform

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test          # Run all tests
npm run build     # Build for production
npm run lint      # Code quality check
```

### Frontend Tests (Coming Soon)
```bash
cd frontend
npm test          # Unit tests
npm run e2e       # End-to-end tests
```

## 📈 Performance

- **Database**: Optimized queries with indexes
- **API**: Response compression and caching
- **Security**: Efficient authentication and validation
- **Scalability**: Serverless architecture ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in each directory
- Review the API documentation

## 🎯 Roadmap

### Completed ✅
- [x] MVP 0: Backend foundations
- [x] Authentication system
- [x] Database schema
- [x] API endpoints
- [x] Security measures
- [x] Vercel deployment setup

### In Progress 🔄
- [ ] MVP 1: Book management
- [ ] Search and discovery
- [ ] Request lifecycle

### Planned 📋
- [ ] MVP 1.1: Messaging and notifications
- [ ] Frontend implementation
- [ ] AI-powered recommendations
- [ ] Community features
- [ ] Mobile app support

---

**Status**: 🚀 MVP 0 Complete - Ready for MVP 1 Development
