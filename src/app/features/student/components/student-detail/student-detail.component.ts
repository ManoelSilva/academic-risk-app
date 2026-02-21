import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../../core/services/student.service';
import { RiskModelService, RiskEvaluationError } from '../../../../core/services/risk-model.service';
import { Student } from '../../../../models/student.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  evaluating = false;
  riskError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private riskModelService: RiskModelService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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

  evaluateRisk(): void {
    if (!this.student?.id) return;

    this.evaluating = true;
    this.riskError = null;

    this.riskModelService.evaluateStudentRisk(this.student.id).subscribe({
      next: (result) => {
        if (this.student) {
          this.student = {
            ...this.student,
            riskScore: result.riskScore,
            riskProbability: result.riskProbability,
            riskLabel: result.riskLabel,
            riskEvaluatedAt: result.riskEvaluatedAt
          };
        }
        this.evaluating = false;
        this.snackBar.open('Risk evaluation completed', 'Close', { duration: 3000 });
      },
      error: (err: RiskEvaluationError) => {
        this.evaluating = false;
        this.riskError = err.message;
        this.snackBar.open(err.message, 'Close', { duration: 5000 });
      }
    });
  }

  get hasRiskEvaluation(): boolean {
    return this.student?.riskLabel != null;
  }

  get riskColorClass(): string {
    if (!this.student?.riskLabel) return '';
    return this.student.riskLabel.toLowerCase().includes('low') ? 'risk-low' : 'risk-high';
  }

  get riskProbabilityPercent(): number {
    return Math.round((this.student?.riskProbability ?? 0) * 100);
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
