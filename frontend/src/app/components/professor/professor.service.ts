import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Professor} from "../../models/professor.model";
import {environment} from "../../../environments/environment";

export type EntityResponseType = HttpResponse<Professor>;
export type EntityArrayResponseType = HttpResponse<Professor[]>;

@Injectable({
    providedIn: 'root',
})
export class ProfessorService {
    /**
     * Change this path if the backend endpoint differs,
     * or pull it from an `environment` file.
     */
    private resourceUrl = environment.apiBaseUrl+'/professors';


    constructor(private http: HttpClient) {}

    /** POST /professors */
    create(professor: Professor): Observable<EntityResponseType> {
        return this.http.post<Professor>(this.resourceUrl, professor, { observe: 'response' });
    }

    /** GET /professors/{id} */
    find(id: number): Observable<EntityResponseType> {
        return this.http.get<Professor>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    /** GET /professors?{queryParams} */
    query(params?: Record<string, any>): Observable<EntityArrayResponseType> {
        return this.http.get<Professor[]>(this.resourceUrl, { params, observe: 'response' });
    }

    /** PUT /professors/{id}  (full update) */
    update(professor: Professor): Observable<EntityResponseType> {
        return this.http.put<Professor>(`${this.resourceUrl}/${professor.id}`, professor, { observe: 'response' });
    }

    /** PATCH /professors/{id}  (partial update) */
    partialUpdate(professor: Partial<Professor> & { id: number }): Observable<EntityResponseType> {
        return this.http.patch<Professor>(`${this.resourceUrl}/${professor.id}`, professor, { observe: 'response' });
    }

    /** DELETE /professors/{id} */
    delete(id: number): Observable<HttpResponse<void>> {
        return this.http.delete<void>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    /**
     * Get all professors (GET /professors).
     * Optional `params` can contain page, size, sort, filters, etc.
     */
    findAll(): Observable<EntityArrayResponseType> {
        return this.http.get<Professor[]>(this.resourceUrl, {observe: 'response'});
    }

    // find all with pagination
    findAllPaginated(page: number, size: number, sort?: string): Observable<EntityArrayResponseType> {
        const params: Record<string, any> = {page, size};
        if (sort) params['sort'] = sort;
        return this.http.get<Professor[]>(this.resourceUrl, {params, observe: 'response'});
    }
}
