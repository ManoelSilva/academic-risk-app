import { TestBed } from '@angular/core/testing';
import { StudentService } from './student.service';
import { StudentRepository } from '../repositories/student.repository';
import { of } from 'rxjs';
import { Student } from '../../models/student.model';

describe('StudentService', () => {
  let service: StudentService;
  let repositorySpy: jasmine.SpyObj<StudentRepository>;

  const mockStudents: Student[] = [
    { id: 1, fullName: 'John Doe', registrationNumber: '12345', course: 'CS', academicYear: 2023, gpa: 8.5, attendancePercentage: 90 }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('StudentRepository', ['getAll', 'getById', 'create', 'update', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        StudentService,
        { provide: StudentRepository, useValue: spy }
      ]
    });
    service = TestBed.inject(StudentService);
    repositorySpy = TestBed.inject(StudentRepository) as jasmine.SpyObj<StudentRepository>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return students', () => {
    repositorySpy.getAll.and.returnValue(of(mockStudents));

    service.getStudents().subscribe(students => {
      expect(students).toEqual(mockStudents);
    });
    expect(repositorySpy.getAll.calls.count()).toBe(1);
  });

  it('should return a student by id', () => {
    const mockStudent = mockStudents[0];
    repositorySpy.getById.and.returnValue(of(mockStudent));

    service.getStudent(1).subscribe(student => {
      expect(student).toEqual(mockStudent);
    });
    expect(repositorySpy.getById.calls.count()).toBe(1);
  });

  it('should create a student', () => {
     const newStudent = { fullName: 'Jane Doe', registrationNumber: '67890', course: 'CS', academicYear: 2023, gpa: 9.0, attendancePercentage: 95 };
     repositorySpy.create.and.returnValue(of({ ...newStudent, id: 2 }));

     service.createStudent(newStudent).subscribe(student => {
       expect(student.id).toBe(2);
     });
     expect(repositorySpy.create.calls.count()).toBe(1);
  });

  it('should throw error when creating invalid student', () => {
      const invalidStudent = { course: 'CS' } as Student;
      expect(() => service.createStudent(invalidStudent)).toThrowError('Full Name and Registration Number are required.');
  });

  it('should update a student', () => {
    const updateData = { gpa: 9.5 };
    repositorySpy.update.and.returnValue(of({ ...mockStudents[0], ...updateData }));

    service.updateStudent(1, updateData).subscribe(student => {
      expect(student.gpa).toBe(9.5);
    });
    expect(repositorySpy.update.calls.count()).toBe(1);
  });

  it('should delete a student', () => {
    repositorySpy.delete.and.returnValue(of(void 0));

    service.deleteStudent(1).subscribe(res => {
      expect(res).toBeUndefined();
    });
    expect(repositorySpy.delete.calls.count()).toBe(1);
  });
});
