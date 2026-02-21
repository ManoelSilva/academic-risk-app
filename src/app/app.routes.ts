import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'students', pathMatch: 'full' },
  { path: 'students', loadChildren: () => import('./features/student/student.module').then(m => m.StudentModule) }
];
