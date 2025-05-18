import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { SubmitPaperComponent } from './pages/submit-paper/submit-paper.component';
import { MyPapersComponent } from './pages/my-papers/my-papers.component';
import { PaperAssignmentComponent } from './pages/paper-assignment/paper-assignment.component';
import { AssignedPapersComponent } from './pages/assigned-papers/assigned-papers.component';
import { ReviewPaperComponent } from './pages/review-paper/review-paper.component';
import { AuthGuard, AuthorGuard, EditorGuard, ReviewerGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'submit',
    component: SubmitPaperComponent,
    canActivate: [AuthorGuard]
  },
  {
    path: 'my-papers',
    component: MyPapersComponent,
    canActivate: [AuthorGuard]
  },
  {
    path: 'assign-papers',
    component: PaperAssignmentComponent,
    canActivate: [EditorGuard]
  },
  {
    path: 'assigned-papers',
    component: AssignedPapersComponent,
    canActivate: [ReviewerGuard]
  },
  {
    path: 'review/:id',
    component: ReviewPaperComponent,
    canActivate: [ReviewerGuard]
  },
  { 
    path: 'register',
    component: RegisterComponent
  },
  { 
    path: 'login',
    component: LoginComponent
  },
  { 
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  { 
    path: '**',
    redirectTo: '/home'
  }
];
