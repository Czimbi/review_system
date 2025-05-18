import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { MaterialModule } from '../../shared/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-assigned-papers',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Assigned Papers for Review</h1>
      
      @if (loading) {
        <div class="flex justify-center items-center h-32">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (error) {
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {{ error }}
        </div>
      } @else if (papers.length === 0) {
        <p class="text-gray-600">No papers are currently assigned to you for review.</p>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (paper of papers; track paper._id) {
            <mat-card class="paper-card">
              <mat-card-header>
                <mat-card-title>{{ paper.title }}</mat-card-title>
                <mat-card-subtitle>
                  Field: {{ paper.field }}
                </mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="mt-4">
                <p class="text-gray-600 line-clamp-3">{{ paper.abstract }}</p>
                
                <div class="mt-4">
                  <mat-chip-set>
                    @for (keyword of paper.keywords; track keyword) {
                      <mat-chip>{{ keyword }}</mat-chip>
                    }
                  </mat-chip-set>
                </div>
              </mat-card-content>
              
              <mat-card-actions align="end">
                <a [routerLink]="['/review', paper._id]" mat-raised-button color="primary">
                  Review Paper
                </a>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .paper-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    mat-card-content {
      flex-grow: 1;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class AssignedPapersComponent implements OnInit {
  papers: any[] = [];
  loading = true;
  error = '';

  constructor(
    private reviewService: ReviewService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAssignedPapers();
  }

  private loadAssignedPapers() {
    this.loading = true;
    this.error = '';
    
    this.reviewService.getAssignedPapers().subscribe({
      next: (response: any) => {
        this.papers = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading assigned papers:', error);
        this.error = error.message || 'Failed to load assigned papers. Please try again later.';
        this.loading = false;
        this.snackBar.open('Failed to load assigned papers', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }
} 