import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentFormComponent } from './student-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StudentService } from '../../../../core/services/student.service';
import { of, throwError } from 'rxjs';
import { Student } from '../../../../models/student.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StudentFormComponent', () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let activatedRouteStub: any;

  const mockStudent: Student = {
    id: 1,
    fullName: 'John Doe',
    registrationNumber: '12345',
    course: 'CS',
    academicYear: 2023,
    gpa: 8.5,
    attendancePercentage: 90
  };

  const setup = async (params: any = {}) => {
    const sSpy = jasmine.createSpyObj('StudentService', ['getStudent', 'createStudent', 'updateStudent']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);
    const sbSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    
    activatedRouteStub = {
      paramMap: of({ get: (key: string) => params[key] })
    };

    await TestBed.configureTestingModule({
      declarations: [StudentFormComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatSnackBarModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: StudentService, useValue: sSpy },
        { provide: Router, useValue: rSpy },
        { provide: MatSnackBar, useValue: sbSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    studentServiceSpy = TestBed.inject(StudentService) as jasmine.SpyObj<StudentService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    
    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
  };

  describe('Create Mode', () => {
    beforeEach(async () => {
      await setup({});
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
      expect(component.isEditMode).toBeFalse();
    });

    it('should initialize empty form', () => {
      expect(component.studentForm.get('fullName')?.value).toBe('');
    });

    it('should initialize academicYearDate to current year', () => {
      const currentYear = new Date().getFullYear();
      expect(component.academicYearDate.getFullYear()).toBe(currentYear);
    });

    it('should set minDate to year 2000 and maxDate to currentYear+2', () => {
      const currentYear = new Date().getFullYear();
      expect(component.minDate.getFullYear()).toBe(2000);
      expect(component.maxDate.getFullYear()).toBe(currentYear + 2);
    });

    it('should update academicYear form value via chosenYearHandler', () => {
      const fakeDate = new Date(2025, 0, 1);
      const fakePicker = { close: jasmine.createSpy('close') } as any;
      component.chosenYearHandler(fakeDate, fakePicker);

      expect(component.academicYearDate.getFullYear()).toBe(2025);
      expect(component.studentForm.get('academicYear')?.value).toBe(2025);
      expect(fakePicker.close).toHaveBeenCalled();
    });

    it('should create student on valid submit', () => {
      component.studentForm.patchValue({
        fullName: 'New Student',
        registrationNumber: '999',
        course: 'Math',
        academicYear: 2024,
        gpa: 9.0,
        attendancePercentage: 100
      });
      
      studentServiceSpy.createStudent.and.returnValue(of(mockStudent));
      component.onSubmit();

      expect(studentServiceSpy.createStudent).toHaveBeenCalled();
      expect(snackBarSpy.open).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/students']);
    });

    it('should handle create error', () => {
      component.studentForm.patchValue({
        fullName: 'New Student',
        registrationNumber: '999',
        course: 'Math',
        academicYear: 2024,
        gpa: 9.0,
        attendancePercentage: 100
      });
          
      studentServiceSpy.createStudent.and.returnValue(throwError(() => new Error('Error')));
      component.onSubmit();
      
      expect(component.loading).toBeFalse();
      expect(snackBarSpy.open).toHaveBeenCalledWith('Error creating student', 'Close', { duration: 3000 });
    });

    it('should not submit invalid form', () => {
      component.onSubmit();
      expect(studentServiceSpy.createStudent).not.toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    beforeEach(async () => {
      await setup({ id: '1' });
      studentServiceSpy.getStudent.and.returnValue(of(mockStudent));
      fixture.detectChanges();
    });

    it('should load student data', () => {
      expect(component.isEditMode).toBeTrue();
      expect(studentServiceSpy.getStudent).toHaveBeenCalledWith(1);
      expect(component.studentForm.get('fullName')?.value).toBe('John Doe');
    });

    it('should sync academicYearDate when loading student', () => {
      expect(component.academicYearDate.getFullYear()).toBe(2023);
    });

    it('should update student on valid submit', () => {
      studentServiceSpy.updateStudent.and.returnValue(of(mockStudent));
      component.onSubmit();

      expect(studentServiceSpy.updateStudent).toHaveBeenCalled();
      expect(snackBarSpy.open).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/students']);
    });

    it('should handle update error', () => {
      studentServiceSpy.updateStudent.and.returnValue(throwError(() => new Error('Error')));
      component.onSubmit();
      
      expect(component.loading).toBeFalse();
      expect(snackBarSpy.open).toHaveBeenCalledWith('Error updating student', 'Close', { duration: 3000 });
    });

    it('should handle load error', () => {
      studentServiceSpy.getStudent.and.returnValue(throwError(() => new Error('Error')));
      component.loadStudent(999);
      expect(snackBarSpy.open).toHaveBeenCalledWith('Error loading student', 'Close', { duration: 3000 });
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/students']);
    });
  });
});
