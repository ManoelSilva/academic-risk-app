import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentRoutingModule } from './student-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { StudentFormComponent } from './components/student-form/student-form.component';
import { StudentDetailComponent } from './components/student-detail/student-detail.component';

@NgModule({
  declarations: [
    StudentListComponent,
    StudentFormComponent,
    StudentDetailComponent,
    DeleteDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    StudentRoutingModule
  ]
})
export class StudentModule { }
