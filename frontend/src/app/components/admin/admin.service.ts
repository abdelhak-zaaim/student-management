import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiBaseUrl + '/admins';

  constructor(private http: HttpClient) { }

  getAllAdmins(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  getAdmin(login: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${login}`);
  }

  createAdmin(admin: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}`, admin);
  }

  updateAdmin(admin: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${admin.id}`, admin);
  }

  deleteAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
