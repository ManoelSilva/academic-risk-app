import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'students', pathMatch: 'full' },
  // Feature modules will be lazy loaded here in Phase 3
  // { path: 'students', loadChildren: () => import('./features/student/student.module').then(m => m.StudentModule) }
];
