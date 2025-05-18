import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  validationErrors: { field: string; message: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      userType: ['', Validators.required],
      institution: ['', Validators.required],
      department: [''],
      title: [''],
      expertise: ['']
    }, {
      validators: this.passwordMatchValidator
    });

    // Subscribe to userType changes to handle expertise field
    this.registerForm.get('userType')?.valueChanges.subscribe(userType => {
      const expertiseControl = this.registerForm.get('expertise');
      if (userType === 'reviewer') {
        expertiseControl?.setValidators([Validators.required]);
      } else {
        expertiseControl?.clearValidators();
        expertiseControl?.setValue('');
      }
      expertiseControl?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.validationErrors = [];

      const formData = { ...this.registerForm.value };
      
      // Only process expertise if userType is reviewer
      if (formData.userType === 'reviewer' && formData.expertise) {
        formData.expertise = formData.expertise.split(',').map((item: string) => item.trim());
      } else {
        delete formData.expertise;
      }

      // Remove confirmPassword as it's not needed for the API
      delete formData.confirmPassword;

      console.log('Sending registration data:', formData);

      this.authService.register(formData).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error: Error) => {
          console.error('Registration error:', error);
          this.errorMessage = error.message;
          
          // Try to parse validation errors from the error message
          if (error.message.startsWith('Validation failed:')) {
            const errorLines = error.message.split('\n').slice(1); // Skip the first line
            this.validationErrors = errorLines.map(line => {
              const [field, message] = line.split(': ');
              return { field, message };
            });
          }
          
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });

      // Log form validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.errors) {
          console.log(`Validation errors for ${key}:`, control.errors);
        }
      });
    }
  }
}
