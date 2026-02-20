import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../../models/student.model';
import { StudentRepository } from '../repositories/student.repository';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(private studentRepository: StudentRepository) { }

  getStudents(): Observable<Student[]> {
    return this.studentRepository.getAll();
  }

  getStudent(id: number): Observable<Student> {
    return this.studentRepository.getById(id);
  }

  createStudent(student: Student): Observable<Student> {
    // Validation logic can be added here
    if (!student.fullName || !student.registrationNumber) {
        throw new Error('Full Name and Registration Number are required.');
    }
    return this.studentRepository.create(student);
  }

  updateStudent(id: number, student: Partial<Student>): Observable<Student> {
     // Validation logic can be added here
    return this.studentRepository.update(id, student);
  }

  deleteStudent(id: number): Observable<void> {
    return this.studentRepository.delete(id);
  }
}
