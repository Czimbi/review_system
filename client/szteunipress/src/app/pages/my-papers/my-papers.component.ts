import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaperService } from '../../services/paper.service';
import { MaterialModule } from '../../shared/material.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { Paper } from '../../services/paper.service';

interface Review {
  _id: string;
  decision: 'accept' | 'reject' | 'revise';
  technicalMerit: number;
  novelty: number;
  clarity: number;
  significance: number;
  publicComments: string;
  reviewer: {
    firstName: string;
    lastName: string;
    email: string;
    institution: string;
  };
  submittedAt: Date;
}

@Component({
  selector: 'app-my-papers',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, MatExpansionModule],
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-6">My Papers</h2>
      
      <div class="alert alert-info" *ngIf="loading">
        Loading your papers...
      </div>
      
      <div class="alert alert-warning" *ngIf="!loading && papers.length === 0">
        You haven't submitted any papers yet.
        <a routerLink="/submit-paper" class="alert-link">Submit your first paper</a>
      </div>

      <div class="alert alert-danger" *ngIf="error">
        {{ error }}
      </div>

      <div class="grid gap-6" *ngIf="!loading && papers.length > 0">
        <mat-card *ngFor="let paper of papers" class="paper-card">
          <mat-card-header>
            <mat-card-title>{{ paper.title }}</mat-card-title>
            <mat-card-subtitle>
              Field: {{ paper.field | titlecase }}
              <span class="badge ms-2" [ngClass]="{
                'bg-primary': paper.status === 'submitted',
                'bg-info': paper.status === 'under_review',
                'bg-success': paper.status === 'accepted',
                'bg-danger': paper.status === 'rejected'
              }">
                {{ paper.status | titlecase }}
              </span>
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content class="mt-4">
            <p class="text-gray-600">{{ paper.abstract }}</p>
            
            <div class="mt-3">
              <strong>Keywords:</strong>
              <mat-chip-set>
                <mat-chip *ngFor="let keyword of paper.keywords">
                  {{ keyword }}
                </mat-chip>
              </mat-chip-set>
            </div>

            <div class="mt-4">
              <h3 class="text-lg font-semibold mb-3">Reviews ({{ paper.reviews.length }})</h3>
              
              <mat-accordion *ngIf="paper.reviews.length > 0">
                <mat-expansion-panel *ngFor="let review of paper.reviews" class="mb-2">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      Review by {{ review.reviewer.firstName }} {{ review.reviewer.lastName }}
                    </mat-panel-title>
                    <mat-panel-description>
                      <span [ngClass]="{
                        'text-success': review.decision === 'accept',
                        'text-danger': review.decision === 'reject',
                        'text-warning': review.decision === 'revise'
                      }">
                        {{ review.decision | titlecase }}
                      </span>
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="review-details">
                    <div class="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <strong>Technical Merit:</strong> {{ review.technicalMerit }}/5
                      </div>
                      <div>
                        <strong>Novelty:</strong> {{ review.novelty }}/5
                      </div>
                      <div>
                        <strong>Clarity:</strong> {{ review.clarity }}/5
                      </div>
                      <div>
                        <strong>Significance:</strong> {{ review.significance }}/5
                      </div>
                    </div>

                    <div class="mb-3">
                      <strong>Public Comments:</strong>
                      <p class="mt-2">{{ review.publicComments }}</p>
                    </div>

                    <div class="text-sm text-gray-600">
                      Reviewed on {{ review.submittedAt | date:'medium' }}
                    </div>
                  </div>
                </mat-expansion-panel>
              </mat-accordion>

              <div class="alert alert-info" *ngIf="paper.reviews.length === 0">
                No reviews available yet.
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-footer class="p-4">
            <small class="text-muted">Submitted: {{ paper.submittedAt | date:'medium' }}</small>
          </mat-card-footer>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .paper-card {
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .badge {
      padding: 0.35em 0.65em;
      font-size: 0.75em;
      font-weight: 700;
      border-radius: 0.25rem;
      color: white;
    }
    .review-details {
      padding: 1rem 0;
    }
    .text-success {
      color: #198754;
    }
    .text-danger {
      color: #dc3545;
    }
    .text-warning {
      color: #ffc107;
    }
    mat-card-subtitle .badge {
      vertical-align: middle;
    }
  `]
})
export class MyPapersComponent implements OnInit {
  papers: Paper[] = [];
  loading = true;
  error = '';

  constructor(private paperService: PaperService) {}

  ngOnInit() {
    this.loadPapers();
  }

  private loadPapers() {
    this.loading = true;
    this.error = '';
    
    this.paperService.getMyPapers().subscribe({
      next: (response) => {
        this.papers = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  withdrawPaper(paperId: string) {
    if (confirm('Are you sure you want to withdraw this paper? This action cannot be undone.')) {
      this.paperService.withdrawPaper(paperId).subscribe({
        next: () => {
          this.papers = this.papers.filter(p => p._id !== paperId);
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }
} 