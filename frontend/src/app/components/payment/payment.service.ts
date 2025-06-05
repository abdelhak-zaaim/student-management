import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Payment} from "../../models/payment.model";
import {environment} from "../../../environments/environment";

export type EntityResponseType = HttpResponse<Payment>;
export type EntityArrayResponseType = HttpResponse<Payment[]>;

@Injectable({
    providedIn: 'root',
})
export class PaymentService {
    /**
     * Adjust the base path if needed
     * (or pull it from an environment file).
     */
    private resourceUrl = environment.apiBaseUrl +'/payments';

    constructor(private http: HttpClient) {}

    /** POST /payments */
    create(payment: Payment): Observable<EntityResponseType> {
        return this.http.post<Payment>(this.resourceUrl, payment, { observe: 'response' });
    }

    /** GET /payments/{id} */
    find(id: number): Observable<EntityResponseType> {
        return this.http.get<Payment>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    /** GET /payments  – all payments, no pagination */
    findAll(): Observable<EntityArrayResponseType> {
        return this.http.get<Payment[]>(this.resourceUrl, { observe: 'response' });
    }

    /**
     * GET /payments?page={page}&size={size}&sort={sort}
     * Example: findAllPaginated(0, 20, 'date,desc')
     */
    findAllPaginated(
        page: number,
        size: number,
        sort?: string
    ): Observable<EntityArrayResponseType> {
        const params: Record<string, any> = { page, size };
        if (sort) params['sort'] = sort;
        return this.http.get<Payment[]>(this.resourceUrl, { params, observe: 'response' });
    }

    /** Generic query helper (allows any query params) */
    query(params?: Record<string, any>): Observable<EntityArrayResponseType> {
        return this.http.get<Payment[]>(this.resourceUrl, { params, observe: 'response' });
    }

    /** PUT /payments/{id}  (full update) */
    update(payment: Payment): Observable<EntityResponseType> {
        return this.http.put<Payment>(`${this.resourceUrl}/${payment.id}`, payment, {
            observe: 'response',
        });
    }

    /** PATCH /payments/{id}  (partial update) */
    partialUpdate(
        payment: Partial<Payment> & { id: number }
    ): Observable<EntityResponseType> {
        return this.http.patch<Payment>(`${this.resourceUrl}/${payment.id}`, payment, {
            observe: 'response',
        });
    }

    /** DELETE /payments/{id} */
    delete(id: number): Observable<HttpResponse<void>> {
        return this.http.delete<void>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}
