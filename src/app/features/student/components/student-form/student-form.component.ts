import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService } from '../../../../core/services/student.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepicker } from '@angular/material/datepicker';

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

  minDate = new Date(2000, 0, 1);
  maxDate = new Date(new Date().getFullYear() + 2, 11, 31);
  academicYearDate: Date;

  readonly pedraOptions = ['Ágata', 'Quartzo', 'Ametista', 'Topázio'];
  readonly pontoViradaOptions = ['Sim', 'Não'];
  readonly sinalizadorIngressanteOptions = ['Ingressante', 'Veterano'];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const currentYear = new Date().getFullYear();
    this.academicYearDate = new Date(currentYear, 0, 1);

    this.studentForm = this.fb.group({
      fullName: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      course: ['', Validators.required],
      academicYear: [currentYear, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      gpa: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
      attendancePercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],

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

  chosenYearHandler(normalizedYear: Date, datepicker: MatDatepicker<Date>): void {
    const year = normalizedYear.getFullYear();
    this.academicYearDate = new Date(year, 0, 1);
    this.studentForm.get('academicYear')?.setValue(year);
    datepicker.close();
  }

  loadStudent(id: number): void {
    this.loading = true;
    this.studentService.getStudent(id).subscribe({
      next: (student) => {
        this.studentForm.patchValue(student);
        if (student.academicYear) {
          this.academicYearDate = new Date(student.academicYear, 0, 1);
        }
        this.loading = false;
      },
      error: () => {
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
        error: () => {
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
        error: () => {
          this.snackBar.open('Error creating student', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }
}
