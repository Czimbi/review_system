import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

interface PaperSubmission {
  title: string;
  authors: string[];
  field: string;
  abstract: string;
  keywords: string[];
}

export interface Paper {
  _id: string;
  title: string;
  authors: string[];
  field: string;
  abstract: string;
  keywords: string[];
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  submittedAt: Date;
  reviews: {
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
  }[];
}

interface ValidationError {
  field: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  errors?: ValidationError[];
}

interface PapersResponse extends ApiResponse {
  data: Paper[];
}

@Injectable({
  providedIn: 'root'
})
export class PaperService {
  private apiUrl = `${environment.apiUrl}/papers`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  submitPaper(paperData: PaperSubmission): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/submit`, paperData, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(response => {
        console.log('Server response:', response);
        if (!response.success && response.error) {
          throw new Error(response.error);
        }
      }),
      catchError(this.handleError)
    );
  }

  getMyPapers(): Observable<PapersResponse> {
    return this.http.get<PapersResponse>(`${this.apiUrl}/my-papers`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(response => {
        if (!response.success && response.error) {
          throw new Error(response.error);
        }
      }),
      catchError(this.handleError)
    );
  }

  withdrawPaper(paperId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/withdraw/${paperId}`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (!response.success && response.error) {
          throw new Error(response.error);
        }
      }),
      catchError(this.handleError)
    );
  }

  getUnassignedPapers(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/unassigned`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (!response.success && response.error) {
          throw new Error(response.error);
        }
      }),
      catchError(this.handleError)
    );
  }

  getAvailableReviewers(paperId: string, field?: string): Observable<ApiResponse> {
    let params = new HttpParams();
    if (field) {
      params = params.set('field', field);
    }
    return this.http.get<ApiResponse>(`${this.apiUrl}/available-reviewers/${paperId}`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      tap(response => {
        if (!response.success && response.error) {
          throw new Error(response.error);
        }
      }),
      catchError(this.handleError)
    );
  }

  assignReviewer(paperId: string, reviewerId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/assign-reviewer`, {
      paperId,
      reviewerId
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (!response.success && response.error) {
          throw new Error(response.error);
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred while processing your request.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check if the server is running.';
      } else if (error.status === 401) {
        errorMessage = 'You are not authorized. Please log in again.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      }

      // Handle validation errors
      if (error.error?.errors && Array.isArray(error.error.errors)) {
        errorMessage = error.error.errors.map((err: ValidationError) => `${err.field}: ${err.message}`).join('\n');
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
} 