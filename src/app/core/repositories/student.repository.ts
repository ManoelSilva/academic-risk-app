import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../../models/student.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudentRepository {
  private readonly apiUrl = '/api/students';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Student[]> {
    return this.http.get<{message: string, data: Student[]}>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getById(id: number): Observable<Student> {
    return this.http.get<{message: string, data: Student}>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  create(student: Student): Observable<Student> {
    return this.http.post<{message: string, data: Student, id: number}>(this.apiUrl, student).pipe(
      map(response => ({ ...response.data, id: response.id }))
    );
  }

  update(id: number, student: Partial<Student>): Observable<Student> {
    return this.http.put<{message: string, data: Student}>(`${this.apiUrl}/${id}`, student).pipe(
      map(response => response.data)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${id}`).pipe(
      map(() => void 0)
    );
  }
}
