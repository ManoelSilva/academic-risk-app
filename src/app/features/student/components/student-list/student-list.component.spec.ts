import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../../../core/services/student.service';
import { of, throwError } from 'rxjs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Student } from '../../../../models/student.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockStudents: Student[] = [
    { id: 1, fullName: 'John Doe', registrationNumber: '123', course: 'CS', academicYear: 2023, gpa: 9, attendancePercentage: 100 }
  ];

  beforeEach(async () => {
    const sSpy = jasmine.createSpyObj('StudentService', ['getStudents', 'deleteStudent']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [StudentListComponent],
      imports: [
        MatDialogModule,
        MatTableModule,
        MatIconModule,
        MatProgressSpinnerModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: StudentService, useValue: sSpy },
        { provide: Router, useValue: rSpy },
        { provide: MatDialog, useValue: dSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    studentServiceSpy = TestBed.inject(StudentService) as jasmine.SpyObj<StudentService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    studentServiceSpy.getStudents.and.returnValue(of(mockStudents));
    
    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students on init', () => {
    expect(studentServiceSpy.getStudents).toHaveBeenCalled();
    expect(component.students).toEqual(mockStudents);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading students', () => {
    spyOn(console, 'error'); // Prevent console.error from showing in test output
    studentServiceSpy.getStudents.and.returnValue(throwError(() => new Error('Error')));
    component.loadStudents();
    expect(component.loading).toBeFalse();
    expect(console.error).toHaveBeenCalled();
  });

  it('should navigate to edit student', () => {
    component.editStudent(mockStudents[0]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/students', 1, 'edit']);
  });

  it('should navigate to view student', () => {
    component.viewStudent(mockStudents[0]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/students', 1]);
  });

  it('should delete student when confirmed', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
    dialogSpy.open.and.returnValue(dialogRefSpyObj);
    studentServiceSpy.deleteStudent.and.returnValue(of(void 0));
    
    // Reset calls from ngOnInit
    studentServiceSpy.getStudents.calls.reset();
    studentServiceSpy.getStudents.and.returnValue(of([])); // Return empty after delete reload

    component.deleteStudent(mockStudents[0]);

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(studentServiceSpy.deleteStudent).toHaveBeenCalledWith(1);
    expect(studentServiceSpy.getStudents).toHaveBeenCalled();
  });

  it('should NOT delete student when cancelled', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null });
    dialogSpy.open.and.returnValue(dialogRefSpyObj);
    
    component.deleteStudent(mockStudents[0]);

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(studentServiceSpy.deleteStudent).not.toHaveBeenCalled();
  });
});
