import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService } from '../../../../core/services/student.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss'],
  standalone: false
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  isEditMode = false;
  studentId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.studentForm = this.fb.group({
      fullName: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      course: ['', Validators.required],
      academicYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      gpa: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
      attendancePercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      
      // Risk Model Fields
      inde: [null],
      iaa: [null],
      ieg: [null],
      ips: [null],
      ida: [null],
      ipp: [null],
      ipv: [null],
      ian: [null],
      defasagem: [null],
      idadeAluno: [null],
      anosPm: [null],
      pedra: [''],
      pontoVirada: [''],
      sinalizadorIngressante: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.studentId = +id;
        this.loadStudent(this.studentId);
      }
    });
  }

  loadStudent(id: number): void {
    this.loading = true;
    this.studentService.getStudent(id).subscribe({
      next: (student) => {
        this.studentForm.patchValue(student);
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Error loading student', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/students']);
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) return;

    this.loading = true;
    const studentData = this.studentForm.value;

    if (this.isEditMode && this.studentId) {
      this.studentService.updateStudent(this.studentId, studentData).subscribe({
        next: () => {
          this.snackBar.open('Student updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/students']);
        },
        error: (err) => {
          this.snackBar.open('Error updating student', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.studentService.createStudent(studentData).subscribe({
        next: () => {
          this.snackBar.open('Student created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/students']);
        },
        error: (err) => {
          this.snackBar.open('Error creating student', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }
}
