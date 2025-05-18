import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {TokenService} from "./token.service";

// Payload must match the backend DTO
export interface LoginPayload {
    username: string;
    password: string;
    rememberMe: boolean;
}

// JHipster sends { id_token: '...' }  (some back-ends send { token: '...' })
export interface LoginResponse {
    id_token?: string;
    token?: string;
}

const TOKEN_KEY = 'app.jwt';

@Injectable({providedIn: 'root'})
export class AuthService {


    constructor(private http: HttpClient, private tokenService: TokenService) {
    }

    login(payload: LoginPayload): Observable<LoginResponse> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });


        return this.http
            .post<LoginResponse>(`${environment.apiBaseUrl}/authenticate`, payload, {headers})
            .pipe(
                tap(res => {
                    const jwt = res.token ?? res.id_token ?? '';
                    if (jwt) {
                        this.tokenService.store(jwt);
                        console.log(this.tokenService.payload);
                    }
                })
            );
    }





    logout(): void {
        localStorage.removeItem(TOKEN_KEY);
    }

    get token(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    get isLoggedIn(): boolean {
        return !!this.token;
    }
}
