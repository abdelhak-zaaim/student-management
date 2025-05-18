import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Group} from "../../models/group.model";

export type EntityResponseType = HttpResponse<Group>;
export type EntityArrayResponseType = HttpResponse<Group[]>;

@Injectable({
    providedIn: 'root',
})
export class GroupService {
    /** Base REST endpoint (adapt if your API path differs) */
    private resourceUrl = '/api/groups';

    constructor(private http: HttpClient) {}

    /** POST /groups */
    create(group: Group): Observable<EntityResponseType> {
        return this.http.post<Group>(this.resourceUrl, group, { observe: 'response' });
    }

    /** GET /groups/{id} */
    find(id: number): Observable<EntityResponseType> {
        return this.http.get<Group>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    /** GET /groups  – returns every group without pagination */
    findAll(): Observable<EntityArrayResponseType> {
        return this.http.get<Group[]>(this.resourceUrl, { observe: 'response' });
    }

    /**
     * GET /groups?page={page}&size={size}&sort={sort}
     * Example: findAllPaginated(1, 10, 'name,asc')
     */
    findAllPaginated(
        page: number,
        size: number,
        sort?: string
    ): Observable<EntityArrayResponseType> {
        const params: Record<string, any> = { page, size };
        if (sort) params['sort'] = sort;
        return this.http.get<Group[]>(this.resourceUrl, { params, observe: 'response' });
    }

    /** Flexible query helper accepting arbitrary query parameters */
    query(params?: Record<string, any>): Observable<EntityArrayResponseType> {
        return this.http.get<Group[]>(this.resourceUrl, { params, observe: 'response' });
    }

    /** PUT /groups/{id}  – full update */
    update(group: Group): Observable<EntityResponseType> {
        return this.http.put<Group>(`${this.resourceUrl}/${group.id}`, group, {
            observe: 'response',
        });
    }

    /** PATCH /groups/{id}  – partial update */
    partialUpdate(
        group: Partial<Group> & { id: number }
    ): Observable<EntityResponseType> {
        return this.http.patch<Group>(`${this.resourceUrl}/${group.id}`, group, {
            observe: 'response',
        });
    }

    /** DELETE /groups/{id} */
    delete(id: number): Observable<HttpResponse<void>> {
        return this.http.delete<void>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}
