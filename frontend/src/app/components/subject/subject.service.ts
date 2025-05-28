import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from '../../models/subject.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = `${environment.apiBaseUrl}/subjects`;

  constructor(private http: HttpClient) { }

  /**
   * Get all subjects
   * @returns Observable with list of subjects
   */
  findAll(): Observable<HttpResponse<Subject[]>> {
    return this.http.get<Subject[]>(this.apiUrl, { observe: 'response' });
  }

  /**
   * Get a specific subject by ID
   */
  findOne(id: number): Observable<HttpResponse<Subject>> {
    return this.http.get<Subject>(`${this.apiUrl}/${id}`, { observe: 'response' });
  }

  /**
   * Create a new subject
   */
  create(subject: Subject): Observable<HttpResponse<Subject>> {
    return this.http.post<Subject>(this.apiUrl, subject, { observe: 'response' });
  }

  /**
   * Update an existing subject
   */
  update(subject: Subject): Observable<HttpResponse<Subject>> {
    return this.http.put<Subject>(`${this.apiUrl}/${subject.id}`, subject, { observe: 'response' });
  }

  /**
   * Delete a subject by ID
   */
  delete(id: number): Observable<HttpResponse<any>> {
    return this.http.delete(`${this.apiUrl}/${id}`, { observe: 'response' });
  }
}
