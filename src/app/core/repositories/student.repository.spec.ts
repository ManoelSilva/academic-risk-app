import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StudentRepository } from './student.repository';
import { Student } from '../../models/student.model';

describe('StudentRepository', () => {
  let repository: StudentRepository;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/students';

  const mockStudents: Student[] = [
    { id: 1, fullName: 'John Doe', registrationNumber: '12345', course: 'CS', academicYear: 2023, gpa: 8.5, attendancePercentage: 90 }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentRepository]
    });
    repository = TestBed.inject(StudentRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  it('should get all students', () => {
    repository.getAll().subscribe(students => {
      expect(students.length).toBe(1);
      expect(students).toEqual(mockStudents);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'success', data: mockStudents });
  });

  it('should get student by id', () => {
    const mockStudent = mockStudents[0];
    repository.getById(1).subscribe(student => {
      expect(student).toEqual(mockStudent);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'success', data: mockStudent });
  });

  it('should create student', () => {
    const newStudent = { fullName: 'Jane Doe', registrationNumber: '67890', course: 'CS', academicYear: 2023, gpa: 9.0, attendancePercentage: 95 };
    repository.create(newStudent).subscribe(student => {
      expect(student.id).toBe(2);
      expect(student.fullName).toBe('Jane Doe');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'success', data: newStudent, id: 2 });
  });

  it('should update student', () => {
    const updateData = { gpa: 9.5 };
    repository.update(1, updateData).subscribe(student => {
      expect(student.gpa).toBe(9.5);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ message: 'success', data: { ...mockStudents[0], ...updateData } });
  });

  it('should delete student', () => {
    repository.delete(1).subscribe(res => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'deleted' });
  });
});
