import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="hero-section text-center py-5">
      <h1 class="display-4 mb-4">Welcome to SZTEUniPress</h1>
      <p class="lead mb-4">The official publication review system of the University of Szeged</p>
      <a routerLink="/submit" class="btn btn-primary btn-lg">Submit Your Publication</a>
    </div>

    <div class="features-section py-5">
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Academic Excellence</h5>
              <p class="card-text">Submit your research papers and publications for review by our expert academic committee.</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Peer Review</h5>
              <p class="card-text">Benefit from thorough peer review process ensuring high-quality academic standards.</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Publication Support</h5>
              <p class="card-text">Get guidance and support throughout the publication process from submission to final release.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-section {
      background-color: var(--bs-light);
      border-radius: 0.5rem;
      margin-bottom: 2rem;
    }
    
    .card {
      transition: transform 0.2s;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .card:hover {
      transform: translateY(-5px);
    }
  `]
})
export class HomeComponent {}
