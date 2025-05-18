import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getAssignedPapers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/assigned`);
  }

  getReview(paperId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${paperId}`);
  }

  submitReview(paperId: string, reviewData: {
    decision: 'accept' | 'reject' | 'pending';
    technicalMerit: number;
    novelty: number;
    clarity: number;
    significance: number;
    publicComments: string;
    privateComments: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${paperId}`, reviewData);
  }

  getPaperReviews(paperId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/paper/${paperId}`);
  }
} 