import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentDetailComponent } from './student-detail.component';
import { StudentService } from '../../../../core/services/student.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of, throwError } from 'rxjs';
import { Student } from '../../../../models/student.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockStudent: Student = {
      id: 1,
      fullName: 'John Doe',
      registrationNumber: '123',
      course: 'CS',
      academicYear: 2023,
      gpa: 8.5,
      attendancePercentage: 90
  };

  beforeEach(async () => {
    const sSpy = jasmine.createSpyObj('StudentService', ['getStudent', 'deleteStudent']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [StudentDetailComponent],
      imports: [
        MatDialogModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: StudentService, useValue: sSpy },
        { provide: Router, useValue: rSpy },
        { provide: MatDialog, useValue: dSpy },
        {
             provide: ActivatedRoute,
             useValue: {
                 snapshot: {
                     paramMap: {
                         get: () => '1'
                     }
                 }
             }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    studentServiceSpy = TestBed.inject(StudentService) as jasmine.SpyObj<StudentService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    studentServiceSpy.getStudent.and.returnValue(of(mockStudent));
    
    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load student on init', () => {
    expect(studentServiceSpy.getStudent).toHaveBeenCalledWith(1);
    expect(component.student).toEqual(mockStudent);
  });

  it('should handle load error', () => {
      spyOn(console, 'error');
      studentServiceSpy.getStudent.and.returnValue(throwError(() => new Error('Error')));
      component.loadStudent(1);
      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
  });

  it('should delete student when confirmed', () => {
      const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
      dialogSpy.open.and.returnValue(dialogRefSpyObj);
      studentServiceSpy.deleteStudent.and.returnValue(of(void 0));
      
      component.deleteStudent();
      
      expect(dialogSpy.open).toHaveBeenCalled();
      expect(studentServiceSpy.deleteStudent).toHaveBeenCalledWith(1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/students']);
  });

  it('should NOT delete student when cancelled', () => {
      const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null });
      dialogSpy.open.and.returnValue(dialogRefSpyObj);
      
      component.deleteStudent();
      
      expect(studentServiceSpy.deleteStudent).not.toHaveBeenCalled();
  });
  
  it('should do nothing if student is null when deleting', () => {
      component.student = null;
      component.deleteStudent();
      expect(dialogSpy.open).not.toHaveBeenCalled();
  });
});
