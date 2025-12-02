import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaperService } from '../../services/paper.service';
import { AuthService } from '../../services/auth.service';

interface PaperSubmission {
  title: string;
  authors: string[];
  field: string;
  abstract: string;
  keywords: string[];
}

@Component({
  selector: 'app-submit-paper',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './submit-paper.component.html',
  styleUrls: ['./submit-paper.component.scss']
})
export class SubmitPaperComponent implements OnInit {
  paperForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  validationErrors: { field: string; message: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private paperService: PaperService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.paperForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      authors: ['', Validators.required],
      field: ['', Validators.required],
      abstract: ['', [Validators.required, Validators.minLength(100)]],
      keywords: ['', Validators.required]
    });

    this.paperForm.statusChanges.subscribe(status => {
      console.log('Form Status:', status);
      console.log('Form Valid:', this.paperForm.valid);
      console.log('Form Values:', this.paperForm.value);
      console.log('Form Errors:', this.paperForm.errors);
    });
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || user.userType !== 'author') {
      this.router.navigate(['/login']);
    }
  }

  private formatPaperData(): PaperSubmission {
    const formValue = this.paperForm.value;
    
    // Handle authors - check if it's already an array
    const authors = Array.isArray(formValue.authors) 
      ? formValue.authors 
      : formValue.authors.split(',').map((author: string) => author.trim()).filter((author: string) => author);

    // Handle keywords - check if it's already an array
    const keywords = Array.isArray(formValue.keywords)
      ? formValue.keywords
      : formValue.keywords.split(',').map((keyword: string) => keyword.trim()).filter((keyword: string) => keyword);

    return {
      title: formValue.title.trim(),
      authors: authors,
      field: formValue.field,
      abstract: formValue.abstract.trim(),
      keywords: keywords
    };
  }

  onSubmit() {
    console.log('Submit button clicked');
    console.log('Form valid:', this.paperForm.valid);
    
    if (this.paperForm.invalid) {
      Object.keys(this.paperForm.controls).forEach(key => {
        const control = this.paperForm.get(key);
        control?.markAsTouched();
      });
      
      Object.keys(this.paperForm.controls).forEach(key => {
        const control = this.paperForm.get(key);
        if (control?.errors) {
          console.log(`Validation errors for ${key}:`, control.errors);
        }
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.validationErrors = [];

    const paperData = this.formatPaperData();
    console.log('Submitting paper data:', paperData);

    this.paperService.submitPaper(paperData).subscribe({
      next: (response) => {
        console.log('Submission successful:', response);
        if (response.success) {
        this.isSubmitting = false;
          this.successMessage = response.message || 'Paper submitted successfully!';
          this.paperForm.reset();
          
          // Navigate to home after 2 seconds
          setTimeout(() => {
        this.router.navigate(['/home'], { 
          queryParams: { 
            message: 'Paper submitted successfully' 
          }
        });
          }, 2000);
        } else {
          this.isSubmitting = false;
          this.errorMessage = response.message || 'Error submitting paper';
          if (response.errors) {
            this.validationErrors = response.errors;
          }
        }
      },
      error: (error: Error) => {
        this.isSubmitting = false;
        console.error('Submission error:', error);
        this.errorMessage = error.message;
        
        // Check if the error message contains multiple lines (validation errors)
        if (error.message.includes('\n')) {
          this.validationErrors = error.message.split('\n').map(line => {
            const [field, message] = line.split(': ');
            return { field, message };
          });
        }
      }
    });
  }
} 