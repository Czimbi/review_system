import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <a class="navbar-brand" routerLink="/home">SZTEUniPress</a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" *ngIf="isLoggedIn">
              <a class="nav-link" routerLink="/home" routerLinkActive="active">Home</a>
            </li>
            <li class="nav-item" *ngIf="isLoggedIn && isAuthor">
              <a class="nav-link" routerLink="/submit" routerLinkActive="active">Submit Paper</a>
            </li>
            <li class="nav-item" *ngIf="isLoggedIn && isAuthor">
              <a class="nav-link" routerLink="/my-papers" routerLinkActive="active">My Papers</a>
            </li>
            <li class="nav-item" *ngIf="isLoggedIn && isEditor">
              <a class="nav-link" routerLink="/assign-papers" routerLinkActive="active">Assign Papers</a>
            </li>
          </ul>
          
          <ul class="navbar-nav">
            <li class="nav-item" *ngIf="isLoggedIn">
              <span class="nav-link">Welcome, {{userEmail}}</span>
            </li>
            <li class="nav-item" *ngIf="!isLoggedIn">
              <a class="nav-link" routerLink="/login">Login</a>
            </li>
            <li class="nav-item" *ngIf="!isLoggedIn">
              <a class="nav-link" routerLink="/register">Register</a>
            </li>
            <li class="nav-item" *ngIf="isLoggedIn">
              <button class="btn btn-link nav-link" (click)="logout()">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .nav-link.active {
      font-weight: bold;
      color: #007bff !important;
    }
    .navbar-brand {
      font-weight: bold;
    }
  `]
})
export class NavComponent implements OnInit {
  isLoggedIn = false;
  isAuthor = false;
  isEditor = false;
  userEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.updateNavigation();
    // Subscribe to auth changes
    this.authService.authStateChanged.subscribe(() => {
      this.updateNavigation();
    });
  }

  private updateNavigation() {
    const user = this.authService.getCurrentUser();
    this.isLoggedIn = !!user;
    this.isAuthor = user?.userType === 'author';
    this.isEditor = user?.userType === 'editor';
    this.userEmail = user?.email || '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 