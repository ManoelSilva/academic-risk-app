import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../../core/services/student.service';
import { Student } from '../../../../models/student.model';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
  standalone: false
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  displayedColumns: string[] = ['id', 'fullName', 'registrationNumber', 'course', 'actions'];
  loading = false;

  constructor(
    private studentService: StudentService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteStudent(student: Student): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: student
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && student.id) {
        this.studentService.deleteStudent(student.id).subscribe(() => {
          this.loadStudents();
        });
      }
    });
  }

  editStudent(student: Student): void {
    this.router.navigate(['/students', student.id, 'edit']);
  }

  viewStudent(student: Student): void {
    this.router.navigate(['/students', student.id]);
  }
}
