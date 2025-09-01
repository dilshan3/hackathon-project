import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { NavigationComponent } from './app/components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavigationComponent
  ],
  template: `
    <div class="app-container">
      <app-navigation></app-navigation>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .main-content {
      flex: 1;
    }
  `]
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      (req, next) => {
        const token = localStorage.getItem('readloop_token');
        if (token && !req.url.includes('/auth/') && !req.url.includes('/healthz')) {
          req = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
          });
        }
        return next(req);
      }
    ])),
    provideAnimationsAsync()
  ]
});