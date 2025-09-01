import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { Me } from '../../../models/user.model';
import { UpdateProfileRequest } from '../../../models/auth-request.model';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="edit-profile-container">
      <div class="edit-profile-content" *ngIf="!isLoadingProfile && profileForm; else loadingTemplate">
        <mat-card class="edit-profile-card">
          <mat-card-header>
            <div class="header-content">
              <mat-icon class="edit-icon">edit</mat-icon>
              <div>
                <mat-card-title>Edit Profile</mat-card-title>
                <mat-card-subtitle>Update your profile information</mat-card-subtitle>
              </div>
            </div>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="edit-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Display Name</mat-label>
                <input matInput formControlName="displayName" placeholder="Enter your display name">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="profileForm.get('displayName')?.hasError('required')">
                  Display name is required
                </mat-error>
                <mat-error *ngIf="profileForm.get('displayName')?.hasError('minlength')">
                  Display name must be at least 2 characters
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>City (Optional)</mat-label>
                <input matInput formControlName="city" placeholder="Enter your city">
                <mat-icon matSuffix>location_city</mat-icon>
              </mat-form-field>
              
              <div class="form-actions">
                <button mat-raised-button type="submit" class="save-btn" 
                        [disabled]="profileForm.invalid || isSubmitting || !hasChanges()">
                  <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
                  <span *ngIf="!isSubmitting">Save Changes</span>
                </button>
                
                <button mat-button type="button" routerLink="/profile" class="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
      
      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading profile...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .edit-profile-container {
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
      padding: 24px;
    }
    
    .edit-profile-content {
      max-width: 500px;
      margin: 0 auto;
    }
    
    .edit-profile-card {
      padding: 24px;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }
    
    .edit-icon {
      color: #4CAF50;
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }
    
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 24px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    
    .save-btn {
      background: #4CAF50;
      color: white;
      height: 44px;
      font-weight: 600;
    }
    
    .save-btn:disabled {
      background: #cccccc;
    }
    
    .cancel-btn {
      color: #666;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .edit-profile-container {
        padding: 16px;
      }
      
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoadingProfile = true;
  isSubmitting = false;
  originalValues: any = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCurrentProfile();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      city: ['']
    });
  }

  private loadCurrentProfile(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user: Me) => {
        this.originalValues = {
          displayName: user.displayName,
          city: user.city || ''
        };
        
        this.profileForm.patchValue(this.originalValues);
        this.isLoadingProfile = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
        this.router.navigate(['/profile']);
      }
    });
  }

  hasChanges(): boolean {
    const currentValues = this.profileForm.value;
    return JSON.stringify(currentValues) !== JSON.stringify(this.originalValues);
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isSubmitting && this.hasChanges()) {
      this.isSubmitting = true;
      
      const updates = this.profileForm.value;
      if (!updates.city) {
        updates.city = undefined;
      }
      
      this.authService.updateProfile(updates).subscribe({
        next: () => {
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Close', { duration: 5000 });
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }
}