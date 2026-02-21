import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../../core/services/student.service';
import { Student } from '../../../../models/student.model';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss'],
  standalone: false
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  loading = false;
  
  // Phase 4 placeholders
  riskScore: number | null = null;
  riskLabel: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudent(+id);
    }
  }

  loadStudent(id: number): void {
    this.loading = true;
    this.studentService.getStudent(id).subscribe({
      next: (student) => {
        this.student = student;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteStudent(): void {
    if (!this.student) return;

    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: this.student
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.student?.id) {
        this.studentService.deleteStudent(this.student.id).subscribe(() => {
          this.router.navigate(['/students']);
        });
      }
    });
  }
}
