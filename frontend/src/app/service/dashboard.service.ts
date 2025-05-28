import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DashboardDTO {
  totalStudents: number;
  totalProfessors: number;
  totalRevenue: number;
  revenueLastMonth: number;
  revenueByMonth: Array<{[key: string]: any}>;
  lastPayments: Array<{[key: string]: any}>;
  professorActivities: Array<{[key: string]: any}>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<DashboardDTO> {
    return this.http.get<DashboardDTO>(`${this.apiUrl}/dashboard`);
  }

  // Legacy methods that can be used as fallbacks if needed
  getStudentCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/students/count`);
  }

  getProfessorCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/professors/count`);
  }

  getGroupCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/groups/count`);
  }
}
