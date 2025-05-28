import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
  }

  getStudentCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/students/count`);
  }

  getProfessorCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/professors/count`);
  }

  getGroupCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/groups/count`);
  }

  getPaymentStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payments/stats`);
  }

  getRecentPayments(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/payments/recent?limit=${limit}`);
  }

  getMonthlyRevenue(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/payments/monthly-revenue`);
  }
}
