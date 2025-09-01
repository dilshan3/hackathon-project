import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, startWith, map, debounceTime, switchMap } from 'rxjs';
import { UserPreferences } from '../../../models/recommendation.model';
import { RecommendationService } from '../../../services/recommendation.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatSliderModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="preferences-container">
      <mat-card class="preferences-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>tune</mat-icon>
            Reading Preferences
          </mat-card-title>
          <mat-card-subtitle>
            Help us recommend books you'll love
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="scrollable-content">
          <form [formGroup]="preferencesForm" (ngSubmit)="onSubmit()">
            <!-- Genre Preferences -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>category</mat-icon>
                Favorite Genres
              </h3>
              <div class="genre-grid">
                <mat-checkbox 
                  *ngFor="let genre of availableGenres" 
                  [checked]="isGenreSelected(genre)"
                  (change)="onGenreChange(genre, $event.checked)"
                  class="genre-checkbox">
                  {{ genre }}
                </mat-checkbox>
              </div>
              <p class="section-hint">Select your favorite genres to get better recommendations</p>
            </div>

            <!-- Author Preferences -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>person</mat-icon>
                Favorite Authors
              </h3>
              <mat-form-field class="full-width" appearance="outline">
                <mat-label>Add favorite authors</mat-label>
                <mat-chip-grid #chipGrid>
                  <mat-chip-row 
                    *ngFor="let author of selectedAuthors; let i = index"
                    (removed)="removeAuthor(i)"
                    [removable]="true">
                    {{ author }}
                    <button matChipRemove>
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </mat-chip-row>
                  <input 
                    [matChipInputFor]="chipGrid"
                    [formControl]="authorInput"
                    [matAutocomplete]="authorAutocomplete"
                    (matChipInputTokenEnd)="addAuthor($event)"
                    placeholder="Type author name...">
                </mat-chip-grid>
                <mat-autocomplete 
                  #authorAutocomplete="matAutocomplete"
                  (optionSelected)="selectAuthor($event)">
                  <mat-option 
                    *ngFor="let author of filteredAuthors | async" 
                    [value]="author">
                    {{ author }}
                  </mat-option>
                </mat-autocomplete>
              </mat-form-field>
              <p class="section-hint">Add authors whose books you've enjoyed</p>
            </div>

            <!-- Reading Goals -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>flag</mat-icon>
                Reading Goals
              </h3>
              <mat-radio-group formControlName="readingGoals" class="radio-group">
                <mat-radio-button value="entertainment" class="radio-option">
                  <div class="radio-content">
                    <strong>Entertainment</strong>
                    <span>Fiction, novels, stories for enjoyment</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button value="learning" class="radio-option">
                  <div class="radio-content">
                    <strong>Learning</strong>
                    <span>Educational, self-improvement, skill development</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button value="research" class="radio-option">
                  <div class="radio-content">
                    <strong>Research</strong>
                    <span>Academic, professional, reference materials</span>
                  </div>
                </mat-radio-button>
              </mat-radio-group>
            </div>

            <!-- Book Length Preference -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>menu_book</mat-icon>
                Preferred Book Length
              </h3>
              <mat-radio-group formControlName="bookLength" class="radio-group">
                <mat-radio-button value="short" class="radio-option">
                  <div class="radio-content">
                    <strong>Short (Under 200 pages)</strong>
                    <span>Quick reads, novellas, short stories</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button value="medium" class="radio-option">
                  <div class="radio-content">
                    <strong>Medium (200-400 pages)</strong>
                    <span>Standard novels and non-fiction</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button value="long" class="radio-option">
                  <div class="radio-content">
                    <strong>Long (400+ pages)</strong>
                    <span>Epic novels, comprehensive guides</span>
                  </div>
                </mat-radio-button>
              </mat-radio-group>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions class="card-actions">
          <button 
            mat-button 
            type="button" 
            (click)="resetPreferences()" 
            [disabled]="isSaving">
            Reset
          </button>
          <button 
            mat-raised-button 
            color="primary" 
            (click)="onSubmit()" 
            [disabled]="!hasChanges() || isSaving">
            <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
            <span *ngIf="!isSaving">Save Preferences</span>
            <span *ngIf="isSaving">Saving...</span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .preferences-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 80vh;
    }

    .preferences-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-width: none;
      width: 100%;
      margin: 0;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: 8px;
      overflow: hidden;
    }

    mat-card-header {
      flex-shrink: 0;
      margin-bottom: 0;
      padding: 20px 24px 16px 24px;
      border-bottom: 1px solid var(--border-primary);
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-primary);
      font-size: 1.4rem;
      margin: 0;
    }

    mat-card-subtitle {
      color: var(--text-secondary);
      margin-left: 36px;
      margin-top: 4px;
      font-size: 0.9rem;
    }

    .scrollable-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      max-height: calc(80vh - 140px);
    }

    /* Custom scrollbar for webkit browsers */
    .scrollable-content::-webkit-scrollbar {
      width: 8px;
    }

    .scrollable-content::-webkit-scrollbar-track {
      background: var(--bg-tertiary);
      border-radius: 4px;
    }

    .scrollable-content::-webkit-scrollbar-thumb {
      background: var(--border-primary);
      border-radius: 4px;
    }

    .scrollable-content::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }

    .form-section {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border-primary);
    }

    .form-section:last-child {
      border-bottom: none;
      margin-bottom: 16px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 16px 0;
      color: var(--text-primary);
      font-size: 1.1rem;
      font-weight: 600;
    }

    .section-hint {
      margin: 8px 0 0 0;
      color: var(--text-muted);
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .genre-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin-bottom: 8px;
    }

    .genre-checkbox {
      padding: 8px;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .genre-checkbox:hover {
      background-color: var(--bg-tertiary);
    }

    .full-width {
      width: 100%;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .radio-option {
      padding: 16px;
      border: 1px solid var(--border-secondary);
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .radio-option:hover {
      border-color: var(--accent-primary);
      background-color: var(--bg-tertiary);
    }

    .radio-option.mat-mdc-radio-checked {
      border-color: var(--accent-primary);
      background-color: rgba(74, 222, 128, 0.1);
    }

    .radio-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-left: 8px;
    }

    .radio-content strong {
      color: var(--text-primary);
      font-weight: 600;
    }

    .radio-content span {
      color: var(--text-secondary);
      font-size: 0.85rem;
      line-height: 1.3;
    }

    .card-actions {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid var(--border-primary);
      background-color: var(--bg-secondary);
    }

    mat-spinner {
      margin-right: 8px;
      --mdc-circular-progress-active-indicator-color: #ffffff;
    }

    /* Chip styling */
    mat-chip-row {
      background-color: rgba(74, 222, 128, 0.2);
      color: var(--accent-primary);
      border: 1px solid rgba(74, 222, 128, 0.3);
    }

    /* Form field styling */
    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-focus-overlay {
      background-color: rgba(74, 222, 128, 0.12);
    }

    ::ng-deep .mat-mdc-form-field-outline .mat-mdc-notched-outline-leading,
    ::ng-deep .mat-mdc-form-field-outline .mat-mdc-notched-outline-notch,
    ::ng-deep .mat-mdc-form-field-outline .mat-mdc-notched-outline-trailing {
      border-color: var(--border-primary);
    }

    ::ng-deep .mat-mdc-form-field-outline.mdc-notched-outline--focused .mat-mdc-notched-outline-leading,
    ::ng-deep .mat-mdc-form-field-outline.mdc-notched-outline--focused .mat-mdc-notched-outline-notch,
    ::ng-deep .mat-mdc-form-field-outline.mdc-notched-outline--focused .mat-mdc-notched-outline-trailing {
      border-color: var(--accent-primary);
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .preferences-container {
        max-height: 90vh;
      }

      .scrollable-content {
        max-height: calc(90vh - 140px);
        padding: 16px;
      }

      .genre-grid {
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .card-actions {
        flex-direction: column;
        gap: 12px;
        padding: 16px;
      }

      .card-actions button {
        width: 100%;
      }

      mat-card-title {
        font-size: 1.2rem;
      }

      .section-title {
        font-size: 1rem;
      }
    }

    @media (max-width: 480px) {
      .genre-grid {
        grid-template-columns: 1fr;
      }

      .radio-option {
        padding: 12px;
      }

      .scrollable-content {
        padding: 12px;
      }
    }

    /* Dialog specific adjustments */
    ::ng-deep .cdk-overlay-pane {
      max-height: 90vh !important;
    }

    ::ng-deep .mat-mdc-dialog-container {
      max-height: 90vh !important;
      overflow: hidden !important;
    }
  `]
})
export class PreferencesComponent implements OnInit {
  @Input() embedded = false; // If used in a dialog or as part of another component
  @Output() preferencesChanged = new EventEmitter<UserPreferences>();

  preferencesForm!: FormGroup;
  authorInput = new FormControl('');
  selectedAuthors: string[] = [];
  availableGenres: string[] = [];
  filteredAuthors!: Observable<string[]>;
  isSaving = false;
  initialPreferences?: UserPreferences;
  currentUserId = '';

  constructor(
    private fb: FormBuilder,
    private recommendationService: RecommendationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
    this.setupAuthorAutocomplete();
  }

  ngOnInit(): void {
    this.loadAvailableGenres();
    this.loadUserPreferences();
    
    // Subscribe to current user to get user ID
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
      }
    });
  }

  private initForm(): void {
    this.preferencesForm = this.fb.group({
      genres: this.fb.array([]),
      readingGoals: [''],
      bookLength: ['']
    });
  }

  private setupAuthorAutocomplete(): void {
    this.filteredAuthors = this.authorInput.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (typeof value === 'string' && value.length >= 2) {
          return this.recommendationService.searchAuthors(value);
        }
        return [];
      })
    );
  }

  private loadAvailableGenres(): void {
    this.recommendationService.getAvailableGenres().subscribe({
      next: (genres) => {
        this.availableGenres = genres;
      },
      error: (error) => {
        console.error('Error loading genres:', error);
      }
    });
  }

  private loadUserPreferences(): void {
    this.recommendationService.getUserPreferences().subscribe({
      next: (preferences) => {
        if (preferences) {
          this.initialPreferences = { ...preferences };
          this.populateForm(preferences);
        }
      },
      error: (error) => {
        console.error('Error loading preferences:', error);
      }
    });
  }

  private populateForm(preferences: UserPreferences): void {
    this.selectedAuthors = preferences.authors || [];
    
    this.preferencesForm.patchValue({
      readingGoals: preferences.readingGoals || '',
      bookLength: preferences.bookLength || ''
    });

    // Set genre checkboxes
    // The genres are handled by the checkboxes in the template
  }

  isGenreSelected(genre: string): boolean {
    return this.initialPreferences?.genres?.includes(genre) || false;
  }

  onGenreChange(genre: string, checked: boolean): void {
    if (!this.initialPreferences) {
      this.initialPreferences = { userId: '', genres: [] };
    }
    
    if (!this.initialPreferences.genres) {
      this.initialPreferences.genres = [];
    }

    if (checked) {
      if (!this.initialPreferences.genres.includes(genre)) {
        this.initialPreferences.genres.push(genre);
      }
    } else {
      this.initialPreferences.genres = this.initialPreferences.genres.filter(g => g !== genre);
    }
  }

  addAuthor(event: any): void {
    const value = (event.value || '').trim();
    if (value && !this.selectedAuthors.includes(value)) {
      this.selectedAuthors.push(value);
      event.chipInput.clear();
      this.authorInput.setValue('');
    }
  }

  selectAuthor(event: any): void {
    const value = event.option.value;
    if (value && !this.selectedAuthors.includes(value)) {
      this.selectedAuthors.push(value);
      this.authorInput.setValue('');
    }
  }

  removeAuthor(index: number): void {
    this.selectedAuthors.splice(index, 1);
  }

  hasChanges(): boolean {
    if (!this.initialPreferences) return true;
    
    const currentPreferences = this.getCurrentPreferences();
    
    return JSON.stringify(this.initialPreferences) !== JSON.stringify(currentPreferences);
  }

  private getCurrentPreferences(): UserPreferences {
    const formValue = this.preferencesForm.value;
    
    return {
      userId: this.currentUserId,
      genres: this.initialPreferences?.genres || [],
      authors: this.selectedAuthors,
      readingGoals: formValue.readingGoals || undefined,
      bookLength: formValue.bookLength || undefined,
      updatedAt: new Date().toISOString()
    };
  }

  onSubmit(): void {
    if (this.preferencesForm.valid && !this.isSaving) {
      this.isSaving = true;
      const preferences = this.getCurrentPreferences();

      this.recommendationService.saveUserPreferences(preferences).subscribe({
        next: () => {
          this.initialPreferences = { ...preferences };
          this.preferencesChanged.emit(preferences);
          
          this.snackBar.open('Preferences saved successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving preferences:', error);
          this.snackBar.open('Error saving preferences. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isSaving = false;
        }
      });
    }
  }

  resetPreferences(): void {
    this.selectedAuthors = [];
    this.preferencesForm.reset();
    this.initialPreferences = { userId: '', genres: [] };
  }
}
