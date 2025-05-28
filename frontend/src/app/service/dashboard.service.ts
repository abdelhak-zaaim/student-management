import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RevenueOverviewDTO {
  totalRevenue: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  percentageChange: number;
  monthOverMonthChange: number;
  averageMonthlyRevenue: number;
  revenueByPaymentMethod: {[key: string]: number};
  topRevenueByStudentGroup: {[key: string]: number};
}

export interface DashboardDTO {
  totalStudents: number;
  totalProfessors: number;
  totalStudentGroups: number;
  totalSubjects: number;
  totalPayments: number;
  pendingPayments: number;
  averagePaymentAmount: number;
  totalRevenue: number;
  revenueLastMonth: number;
  revenueByMonth: Array<{[key: string]: any}>;
  lastPayments: Array<{[key: string]: any}>;
  professorActivities: Array<{[key: string]: any}>;
  studentsPerGroup: {[key: string]: number};
  paymentsPerStatus: {[key: string]: number};
  revenueOverview: RevenueOverviewDTO;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiBaseUrl || '/api';

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
