# ReadLoop Frontend

A modern Angular application for book sharing within local communities. This is MVP 0 focusing on user authentication, profile management, and system health monitoring.

## Features

- **User Authentication**: Complete registration and login system with JWT tokens
- **Profile Management**: View and edit user profiles with real-time updates
- **Health Monitoring**: System health check functionality
- **Responsive Design**: Mobile-first design with Material Design components
- **Type Safety**: Full TypeScript implementation with proper type definitions

## Tech Stack

- **Angular 20** - Latest stable version
- **Angular Material** - UI component library
- **RxJS** - Reactive programming for state management
- **TypeScript** - Type-safe development
- **Angular Reactive Forms** - Form handling with validation

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── navigation/
│   │   ├── profile/
│   │   │   └── edit-profile/
│   │   ├── health/
│   │   └── home/
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   ├── services/
│   └── app.routes.ts
├── global_styles.css
├── index.html
└── main.ts
```

## API Integration

The application integrates with the following API endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/me` - Get current user profile
- `PUT /api/me` - Update user profile
- `GET /healthz` - System health check

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Configuration

The application expects the backend API to be running on `http://localhost:3000`. You can modify the API base URL in the `AuthService` if needed.

## Authentication Flow

1. **Registration**: Users can create accounts with email, password, display name, and optional city
2. **Login**: Existing users can authenticate with email and password
3. **JWT Storage**: Tokens are stored in localStorage with automatic expiration handling
4. **Route Protection**: Protected routes require authentication via AuthGuard
5. **Auto-logout**: Users are automatically logged out when tokens expire

## Form Validation

- **Email**: Valid email format required
- **Password**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **Display Name**: Minimum 2 characters required
- **City**: Optional field

## Error Handling

- **401 Unauthorized**: Automatic logout and redirect to login
- **409 Conflict**: Email already taken error handling
- **Network Errors**: User-friendly error messages
- **Loading States**: Visual feedback during API calls

## Security Features

- **JWT Token Management**: Secure token storage and automatic attachment to API calls
- **Route Guards**: Prevent unauthorized access to protected routes
- **HTTP Interceptor**: Automatic Bearer token attachment
- **Token Expiration**: Automatic logout when tokens expire

## Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Flexible grid layouts
- Touch-friendly interface elements
- Optimized navigation for mobile devices

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow Angular style guide
2. Use TypeScript strict mode
3. Implement proper error handling
4. Add appropriate tests
5. Maintain responsive design principles

## License

This project is part of the ReadLoop MVP development.