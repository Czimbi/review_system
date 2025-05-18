import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaperService } from '../../services/paper.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Paper {
  _id: string;
  title: string;
  field: string;
  abstract: string;
  author: {
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewers: string[];
}

interface Reviewer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  expertise: string[];
  institution: string;
  department: string;
}

@Component({
  selector: 'app-paper-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2 class="mb-4">Paper Assignment</h2>
      
      <div class="alert alert-info" *ngIf="loading">
        Loading papers and reviewers...
      </div>

      <div class="alert alert-danger" *ngIf="error">
        {{ error }}
      </div>

      <div class="row" *ngIf="!loading && papers.length === 0">
        <div class="col-12">
          <div class="alert alert-info">
            No unassigned papers available at the moment.
          </div>
        </div>
      </div>

      <div class="row" *ngIf="!loading && papers.length > 0">
        <div class="col-12">
          <div class="card mb-4" *ngFor="let paper of papers">
            <div class="card-body">
              <h5 class="card-title">{{ paper.title }}</h5>
              <p class="card-text">
                <strong>Field:</strong> {{ paper.field }}
              </p>
              <p class="card-text">
                <strong>Author:</strong> {{ paper.author.firstName }} {{ paper.author.lastName }}
                ({{ paper.author.email }})
              </p>
              <p class="card-text">{{ paper.abstract }}</p>

              <div class="mt-3">
                <h6>Assign Reviewers ({{ paper.reviewers.length }}/3 assigned)</h6>
                <div class="progress mb-3">
                  <div 
                    class="progress-bar" 
                    role="progressbar" 
                    [style.width.%]="(paper.reviewers.length / 3) * 100"
                    [attr.aria-valuenow]="paper.reviewers.length"
                    aria-valuemin="0" 
                    aria-valuemax="3">
                    {{ paper.reviewers.length }}/3
                  </div>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Expertise</th>
                        <th>Institution</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let reviewer of getMatchingReviewers(paper.field)">
                        <td>{{ reviewer.firstName }} {{ reviewer.lastName }}</td>
                        <td>{{ reviewer.expertise.join(', ') }}</td>
                        <td>{{ reviewer.institution }}</td>
                        <td>
                          <button 
                            class="btn btn-primary btn-sm"
                            [disabled]="isReviewerAssigned(paper, reviewer._id) || paper.reviewers.length >= 3"
                            (click)="assignReviewer(paper._id, reviewer._id)"
                          >
                            {{ isReviewerAssigned(paper, reviewer._id) ? 'Assigned' : 'Assign' }}
                          </button>
                        </td>
                      </tr>
                      <tr *ngIf="getMatchingReviewers(paper.field).length === 0">
                        <td colspan="4" class="text-center">
                          No matching reviewers found for this paper's field.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
    }
    .table {
      margin-bottom: 0;
    }
    .btn-sm {
      padding: 0.25rem 0.5rem;
    }
    .progress {
      height: 20px;
    }
    .progress-bar {
      background-color: #007bff;
      color: white;
      text-align: center;
      line-height: 20px;
      font-size: 12px;
    }
  `]
})
export class PaperAssignmentComponent implements OnInit {
  papers: Paper[] = [];
  reviewers: Reviewer[] = [];
  loading = true;
  error = '';

  constructor(
    private paperService: PaperService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loading = true;
    this.error = '';

    // First load unassigned papers
    this.paperService.getUnassignedPapers().subscribe({
      next: (response) => {
        this.papers = response.data;
        // Then load reviewers for each paper
        if (this.papers.length > 0) {
          this.paperService.getAvailableReviewers(this.papers[0]._id).subscribe({
            next: (reviewersResponse) => {
              this.reviewers = reviewersResponse.data;
              this.loading = false;
            },
            error: (error) => {
              console.error('Error loading reviewers:', error);
              this.error = error.message;
              this.loading = false;
              this.showErrorMessage('Failed to load reviewers');
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading papers:', error);
        this.error = error.message;
        this.loading = false;
        this.showErrorMessage('Failed to load papers');
      }
    });
  }

  getMatchingReviewers(field: string): Reviewer[] {
    return this.reviewers.filter(reviewer => 
      reviewer.expertise.includes(field)
    );
  }

  isReviewerAssigned(paper: Paper, reviewerId: string): boolean {
    return paper.reviewers.includes(reviewerId);
  }

  assignReviewer(paperId: string, reviewerId: string) {
    this.paperService.assignReviewer(paperId, reviewerId).subscribe({
      next: (response) => {
        if (response.success) {
          // Update the paper in the list
          const paperIndex = this.papers.findIndex(p => p._id === paperId);
          if (paperIndex !== -1) {
            this.papers[paperIndex] = response.data;
          }
          // If the paper now has 3 reviewers, remove it from the list
          if (response.data.reviewers.length >= 3) {
            this.papers = this.papers.filter(p => p._id !== paperId);
          }
          this.showSuccessMessage('Reviewer assigned successfully');
        }
      },
      error: (error) => {
        console.error('Error assigning reviewer:', error);
        this.error = error.message;
        this.showErrorMessage(error.message || 'Failed to assign reviewer');
      }
    });
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
} 