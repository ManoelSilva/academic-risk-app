import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentDetailComponent } from './student-detail.component';
import { StudentService } from '../../../../core/services/student.service';
import { RiskModelService, RiskEvaluationError } from '../../../../core/services/risk-model.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { Student } from '../../../../models/student.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RiskEvaluationResult } from '../../../../models/academic-risk.model';

describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let riskModelServiceSpy: jasmine.SpyObj<RiskModelService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockStudent: Student = {
    id: 1,
    fullName: 'John Doe',
    registrationNumber: '123',
    course: 'CS',
    academicYear: 2023,
    gpa: 8.5,
    attendancePercentage: 90,
    inde: 7.5,
    iaa: 8.0,
    ieg: 6.5
  };

  const mockRiskResult: RiskEvaluationResult = {
    riskScore: 0,
    riskProbability: 0.12,
    riskLabel: 'Low Risk',
    riskEvaluatedAt: '2026-02-21T00:00:00.000Z'
  };

  beforeEach(async () => {
    const sSpy = jasmine.createSpyObj('StudentService', ['getStudent', 'deleteStudent']);
    const rmSpy = jasmine.createSpyObj('RiskModelService', ['evaluateStudentRisk']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const sbSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [StudentDetailComponent],
      imports: [
        MatDialogModule,
        MatSnackBarModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: StudentService, useValue: sSpy },
        { provide: RiskModelService, useValue: rmSpy },
        { provide: Router, useValue: rSpy },
        { provide: MatDialog, useValue: dSpy },
        { provide: MatSnackBar, useValue: sbSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    studentServiceSpy = TestBed.inject(StudentService) as jasmine.SpyObj<StudentService>;
    riskModelServiceSpy = TestBed.inject(RiskModelService) as jasmine.SpyObj<RiskModelService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

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

  describe('Risk Evaluation', () => {
    it('should evaluate risk successfully', () => {
      riskModelServiceSpy.evaluateStudentRisk.and.returnValue(of(mockRiskResult));

      component.evaluateRisk();

      expect(riskModelServiceSpy.evaluateStudentRisk).toHaveBeenCalledWith(1);
      expect(component.evaluating).toBeFalse();
      expect(component.student?.riskLabel).toBe('Low Risk');
      expect(component.student?.riskProbability).toBe(0.12);
      expect(component.student?.riskScore).toBe(0);
      expect(component.student?.riskEvaluatedAt).toBe('2026-02-21T00:00:00.000Z');
      expect(snackBarSpy.open).toHaveBeenCalledWith('Risk evaluation completed', 'Close', { duration: 3000 });
    });

    it('should handle risk evaluation error', () => {
      const riskError = new RiskEvaluationError('Risk Model API timed out', 'timeout', 504);
      riskModelServiceSpy.evaluateStudentRisk.and.returnValue(throwError(() => riskError));

      component.evaluateRisk();

      expect(component.evaluating).toBeFalse();
      expect(component.riskError).toBe('Risk Model API timed out');
      expect(snackBarSpy.open).toHaveBeenCalledWith('Risk Model API timed out', 'Close', { duration: 5000 });
    });

    it('should do nothing when student is null', () => {
      component.student = null;
      component.evaluateRisk();
      expect(riskModelServiceSpy.evaluateStudentRisk).not.toHaveBeenCalled();
    });

    it('should do nothing when student has no id', () => {
      component.student = { ...mockStudent, id: undefined };
      component.evaluateRisk();
      expect(riskModelServiceSpy.evaluateStudentRisk).not.toHaveBeenCalled();
    });

    it('should set evaluating to true during evaluation', () => {
      riskModelServiceSpy.evaluateStudentRisk.and.returnValue(of(mockRiskResult));
      component.evaluateRisk();
      expect(component.evaluating).toBeFalse();
    });

    it('should clear previous riskError on new evaluation', () => {
      component.riskError = 'Previous error';
      riskModelServiceSpy.evaluateStudentRisk.and.returnValue(of(mockRiskResult));
      component.evaluateRisk();
      expect(component.riskError).toBeNull();
    });
  });

  describe('Computed Properties', () => {
    it('hasRiskEvaluation should return false when no riskLabel', () => {
      component.student = { ...mockStudent, riskLabel: undefined };
      expect(component.hasRiskEvaluation).toBeFalse();
    });

    it('hasRiskEvaluation should return true when riskLabel is set', () => {
      component.student = { ...mockStudent, riskLabel: 'Low Risk' };
      expect(component.hasRiskEvaluation).toBeTrue();
    });

    it('hasRiskEvaluation should return false when student is null', () => {
      component.student = null;
      expect(component.hasRiskEvaluation).toBeFalse();
    });

    it('riskColorClass should return risk-low for Low Risk', () => {
      component.student = { ...mockStudent, riskLabel: 'Low Risk' };
      expect(component.riskColorClass).toBe('risk-low');
    });

    it('riskColorClass should return risk-high for High Risk', () => {
      component.student = { ...mockStudent, riskLabel: 'High Risk' };
      expect(component.riskColorClass).toBe('risk-high');
    });

    it('riskColorClass should return empty string when no riskLabel', () => {
      component.student = { ...mockStudent, riskLabel: undefined };
      expect(component.riskColorClass).toBe('');
    });

    it('riskProbabilityPercent should return rounded percentage', () => {
      component.student = { ...mockStudent, riskProbability: 0.876 };
      expect(component.riskProbabilityPercent).toBe(88);
    });

    it('riskProbabilityPercent should return 0 when no probability', () => {
      component.student = { ...mockStudent, riskProbability: undefined };
      expect(component.riskProbabilityPercent).toBe(0);
    });

    it('riskProbabilityPercent should return 0 when student is null', () => {
      component.student = null;
      expect(component.riskProbabilityPercent).toBe(0);
    });
  });
});
