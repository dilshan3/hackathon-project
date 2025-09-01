# 🚀 ReadLoop Backend Setup Guide

## 🗄️ **Neon Database Setup**

### 1. Database Connection
Your Neon database is already configured with these environment variables in Vercel:
- `DATABASE_URL`: ✅ Set
- `JWT_SECRET`: ✅ Set  
- `CORS_ORIGIN`: ✅ Set

### 2. Run Database Schema
```bash
# Set your DATABASE_URL locally (copy from Vercel)
export DATABASE_URL="your-neon-connection-string"

# Run the database setup
npm run db:setup
```

### 3. Verify Database Connection
The setup script will:
- ✅ Connect to Neon database
- ✅ Create all tables (users, books, book_requests, messages)
- ✅ Set up indexes and triggers
- ✅ Test the connection

## 🔑 **GitHub Actions Setup**

### 1. Required Secrets
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=dilshanprasadbrown-1596s-projects
VERCEL_PROJECT_ID=prj_iko9zEhGHZRq7S0LdaxfbrqF47NQ
```

### 2. Get Vercel Token
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token
3. Copy the token value

### 3. How It Works
- **On Push to main/master**: Runs tests → Builds → Deploys to Vercel
- **On Pull Request**: Runs tests and builds (no deployment)
- **Matrix Testing**: Tests on Node.js 18.x and 20.x

## 🧪 **Test Your API**

### 1. Test Database Connection
```bash
npm run db:setup
```

### 2. Test Health Endpoint
```bash
curl https://read-loop-backend.vercel.app/healthz
```

### 3. Test Authentication
```bash
# Register a user
curl -X POST https://read-loop-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "displayName": "Test User",
    "city": "Test City"
  }'
```

## 📁 **Project Structure**
```
backend/
├── .github/workflows/     # GitHub Actions
├── src/                   # Source code
├── dist/                  # Compiled code
├── setup-db.js           # Database setup script
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies and scripts
```

## 🚀 **Deployment Flow**
1. **Push to main branch** → GitHub Actions trigger
2. **Run tests** → Lint, type-check, unit tests
3. **Build project** → TypeScript compilation + path alias resolution
4. **Deploy to Vercel** → Automatic production deployment

## 🔧 **Troubleshooting**

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure Neon instance is running
- Verify SSL settings

### Build Issues
- Run `npm run build` locally first
- Check TypeScript errors
- Verify all dependencies installed

### Deployment Issues
- Check Vercel logs: `npx vercel logs [url]`
- Verify environment variables
- Check GitHub Actions secrets

## 📞 **Support**
- **Vercel Issues**: Check deployment logs
- **Database Issues**: Run `npm run db:setup`
- **Build Issues**: Check TypeScript compilation
- **GitHub Actions**: Check Actions tab in repository
