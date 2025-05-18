import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { MaterialModule } from '../../shared/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-review-paper',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card class="max-w-3xl mx-auto">
        <mat-card-header>
          <mat-card-title>Review Paper</mat-card-title>
          @if (paper) {
            <mat-card-subtitle>{{ paper.title }}</mat-card-subtitle>
          }
        </mat-card-header>

        <mat-card-content class="mt-4">
          @if (reviewForm) {
            <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
              <mat-form-field>
                <mat-label>Decision</mat-label>
                <mat-select formControlName="decision" required>
                  <mat-option value="accept">Accept</mat-option>
                  <mat-option value="reject">Reject</mat-option>
                  <mat-option value="pending">Pending</mat-option>
                </mat-select>
                @if (reviewForm.get('decision')?.hasError('required') && reviewForm.get('decision')?.touched) {
                  <mat-error>Decision is required</mat-error>
                }
              </mat-form-field>

              <div class="rating-section">
                <h3 class="text-lg font-semibold mb-4">Rating Criteria</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="rating-item">
                    <label>Technical Merit (1-5)</label>
                    <mat-slider min="1" max="5" step="1" discrete>
                      <input matSliderThumb formControlName="technicalMerit">
                    </mat-slider>
                  </div>

                  <div class="rating-item">
                    <label>Novelty (1-5)</label>
                    <mat-slider min="1" max="5" step="1" discrete>
                      <input matSliderThumb formControlName="novelty">
                    </mat-slider>
                  </div>

                  <div class="rating-item">
                    <label>Clarity (1-5)</label>
                    <mat-slider min="1" max="5" step="1" discrete>
                      <input matSliderThumb formControlName="clarity">
                    </mat-slider>
                  </div>

                  <div class="rating-item">
                    <label>Significance (1-5)</label>
                    <mat-slider min="1" max="5" step="1" discrete>
                      <input matSliderThumb formControlName="significance">
                    </mat-slider>
                  </div>
                </div>
              </div>

              <mat-form-field>
                <mat-label>Public Comments</mat-label>
                <textarea
                  matInput
                  formControlName="publicComments"
                  rows="4"
                  required
                  placeholder="These comments will be visible to the authors"
                ></textarea>
                @if (reviewForm.get('publicComments')?.hasError('required') && reviewForm.get('publicComments')?.touched) {
                  <mat-error>Public comments are required</mat-error>
                }
                @if (reviewForm.get('publicComments')?.hasError('minlength')) {
                  <mat-error>Comments must be at least 50 characters</mat-error>
                }
              </mat-form-field>

              <mat-form-field>
                <mat-label>Private Comments</mat-label>
                <textarea
                  matInput
                  formControlName="privateComments"
                  rows="4"
                  required
                  placeholder="These comments will only be visible to editors"
                ></textarea>
                @if (reviewForm.get('privateComments')?.hasError('required') && reviewForm.get('privateComments')?.touched) {
                  <mat-error>Private comments are required</mat-error>
                }
                @if (reviewForm.get('privateComments')?.hasError('minlength')) {
                  <mat-error>Comments must be at least 50 characters</mat-error>
                }
              </mat-form-field>

              <div class="flex justify-end gap-4">
                <button
                  type="button"
                  mat-button
                  (click)="goBack()"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  mat-raised-button
                  color="primary"
                  [disabled]="reviewForm.invalid || isSubmitting"
                >
                  Submit Review
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .rating-section {
      background-color: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 1rem 0;
    }
    .rating-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    mat-slider {
      width: 100%;
    }
  `]
})
export class ReviewPaperComponent implements OnInit {
  reviewForm: FormGroup | null = null;
  paper: any = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadExistingReview();
  }

  private initForm() {
    this.reviewForm = this.fb.group({
      decision: ['', Validators.required],
      technicalMerit: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      novelty: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      clarity: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      significance: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      publicComments: ['', [Validators.required, Validators.minLength(50)]],
      privateComments: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  private loadExistingReview() {
    const paperId = this.route.snapshot.paramMap.get('id');
    if (!paperId) {
      this.snackBar.open('Paper ID not found', 'Close', { duration: 3000 });
      this.router.navigate(['/assigned-papers']);
      return;
    }

    this.reviewService.getReview(paperId).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.reviewForm?.patchValue(response.data);
        }
      },
      error: (error: any) => {
        console.error('Error loading review:', error);
      }
    });
  }

  onSubmit() {
    if (this.reviewForm?.invalid) {
      return;
    }

    this.isSubmitting = true;
    const paperId = this.route.snapshot.paramMap.get('id');
    if (!paperId) {
      return;
    }

    this.reviewService.submitReview(paperId, this.reviewForm?.value).subscribe({
      next: () => {
        this.snackBar.open('Review submitted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/assigned-papers']);
      },
      error: (error: any) => {
        console.error('Error submitting review:', error);
        this.snackBar.open('Error submitting review', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/assigned-papers']);
  }
} 