import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formData = this.loginForm.value;

      this.authService.login(formData).subscribe({
        next: (response) => {
          if (response.success && response.user) {
          const user = this.authService.getCurrentUser();
          if (user) {
            switch (user.userType) {
              case 'author':
                  this.router.navigate(['/my-papers']);
                  break;
                case 'editor':
                  this.router.navigate(['/assign-papers']);
                break;
              case 'reviewer':
                this.router.navigate(['/review-papers']);
                break;
              default:
                this.router.navigate(['/home']);
              }
            } else {
              this.errorMessage = 'Error accessing user data';
            }
          } else {
            this.errorMessage = response.message || 'Invalid login response';
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred during login';
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }
} 