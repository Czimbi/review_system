import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'author' | 'reviewer' | 'editor';
  institution: string;
  department?: string;
  title?: string;
  expertise?: string[];
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';
  private userKey = 'current_user';
  private isBrowser: boolean;
  private authStateSubject: BehaviorSubject<boolean>;

  authStateChanged: Observable<boolean>;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.authStateSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
    this.authStateChanged = this.authStateSubject.asObservable();
    
    if (this.isBrowser) {
      this.checkAuthState();
    }
  }

  private checkAuthState() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    this.authStateSubject.next(!!token && !!user);
  }

  private setAuthData(token: string, user: User) {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.authStateSubject.next(true);
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || 'Server error';
    }
    return throwError(() => new Error(errorMessage));
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.token && response.user) {
            this.setAuthData(response.token, response.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.token && response.user) {
            this.setAuthData(response.token, response.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.authStateSubject.next(false);
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    const userStr = localStorage.getItem(this.userKey);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return !!this.getToken() && !!this.getCurrentUser();
  }

  isAuthor(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    const user = this.getCurrentUser();
    return user?.userType === 'author';
  }

  getUserRole(): 'author' | 'reviewer' | 'editor' | null {
    return this.getCurrentUser()?.userType || null;
  }
} 