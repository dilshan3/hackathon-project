import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/edit',
    loadComponent: () => import('./components/profile/edit-profile/edit-profile.component').then(m => m.EditProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'books',
    loadComponent: () => import('./components/books/book-search/book-search.component').then(m => m.BookSearchComponent)
  },
  {
    path: 'books/add',
    loadComponent: () => import('./components/books/add-book/add-book.component').then(m => m.AddBookComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'books/mine',
    loadComponent: () => import('./components/books/my-books/my-books.component').then(m => m.MyBooksComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'books/:id',
    loadComponent: () => import('./components/books/book-details/book-details.component').then(m => m.BookDetailsComponent)
  },
  {
    path: 'books/:id/edit',
    loadComponent: () => import('./components/books/edit-book/edit-book.component').then(m => m.EditBookComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'requests',
    loadComponent: () => import('./components/requests/requests/requests.component').then(m => m.RequestsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'requests/:id',
    loadComponent: () => import('./components/requests/request-details/request-details.component').then(m => m.RequestDetailsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'recommendations',
    loadComponent: () => import('./components/recommendations/recommendations/recommendations.component').then(m => m.RecommendationComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'preferences',
    loadComponent: () => import('./components/recommendations/preferences/preferences.component').then(m => m.PreferencesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'health',
    loadComponent: () => import('./components/health/health.component').then(m => m.HealthComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];