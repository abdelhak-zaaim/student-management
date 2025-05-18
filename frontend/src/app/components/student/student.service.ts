import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Student} from "../../models/student.model";
import {environment} from "../../../environments/environment";

/**
 * Wrapper types for strong typing of HttpClient responses.
 */
export type EntityResponseType = HttpResponse<Student>;
export type EntityArrayResponseType = HttpResponse<Student[]>;

@Injectable({
    providedIn: 'root',
})
export class StudentService {
    /**
     * Adjust the base URL if your API lives elsewhere.
     * You can also move this to an environment file:
     *   private resourceUrl = `${environment.apiUrl}/students`;
     */
    private resourceUrl = environment.apiBaseUrl+'/students';

    constructor(private http: HttpClient) {
    }

    /**
     * Create a new student (POST /students).
     */
    create(student: Student): Observable<EntityResponseType> {
        return this.http.post<Student>(this.resourceUrl, student, {observe: 'response'});
    }

    /**
     * Get a single student by id (GET /students/{id}).
     */
    find(id: number): Observable<EntityResponseType> {
        return this.http.get<Student>(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    /**
     * Get all students (GET /students).
     * Optional `params` can contain page, size, sort, filters, etc.
     */
    query(params?: Record<string, any>): Observable<EntityArrayResponseType> {
        return this.http.get<Student[]>(this.resourceUrl, {params, observe: 'response'});
    }

    /**
     * Update an existing student completely (PUT /students/{id}).
     */
    update(student: Student): Observable<EntityResponseType> {
        return this.http.put<Student>(`${this.resourceUrl}/${student.id}`, student, {observe: 'response'});
    }

    /**
     * Partially update an existing student (PATCH /students/{id}).
     * Send only the fields you want to modify.
     */
    partialUpdate(student: Partial<Student> & { id: number }): Observable<EntityResponseType> {
        return this.http.patch<Student>(`${this.resourceUrl}/${student.id}`, student, {observe: 'response'});
    }

    /**
     * Delete a student by id (DELETE /students/{id}).
     */
    delete(id: number): Observable<HttpResponse<void>> {
        return this.http.delete<void>(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    /**
     * Get all students (GET /students).
     * Optional `params` can contain page, size, sort, filters, etc.
     */
    findAll(): Observable<EntityArrayResponseType> {
        return this.http.get<Student[]>(this.resourceUrl, {observe: 'response'});
    }

    // find all with pagination
    findAllPaginated(page: number, size: number, sort?: string): Observable<EntityArrayResponseType> {
        const params: Record<string, any> = {page, size};
        if (sort) params['sort'] = sort;
        return this.http.get<Student[]>(this.resourceUrl, {params, observe: 'response'});
    }


}
