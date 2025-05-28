import { Injectable } from '@angular/core';

export interface JwtPayload {
    sub:  string;  // username or userId
    auth: string;  // ROLE_ADMIN, ROLE_USER, …
    exp:  number;  // epoch-seconds
    iat:  number;  // issued-at
    // add more custom claims here if your backend sets them
}

@Injectable({ providedIn: 'root' })
export class TokenService {

    /* Call this right after a successful login */
    store(token: string): void {
        localStorage.setItem('token', token);
    }

    /* Returns the raw token or null */
    get token(): string | null {
        return localStorage.getItem('token');
    }

    /* A typed version of the payload (or null if token missing / malformed) */
    get payload(): JwtPayload | null {
        const raw = this.token;
        if (!raw) { return null; }

        try {
            const payloadPart = raw.split('.')[1];
            const decoded = atob(this.padBase64(payloadPart));
            return JSON.parse(decoded) as JwtPayload;
        } catch {
            return null;
        }
    }

    /* Handy derived info ---------------------------------------------------- */

    /** `true` if token exists and current time is before exp */
    get isAuthenticated(): boolean {
        if (!this.payload) { return false; }
        return (Date.now() / 1000) < this.payload.exp;
    }

    /** Username / userId from `sub` */
    get username(): string | null {
        return this.payload?.sub ?? null;
    }

    /** Role from your `auth` claim */
    get role(): string | null {
        return this.payload?.auth ?? null;
    }

    /* ---------------------------------------------------------------------- */
    /* Helpers                                                                */
    /* ---------------------------------------------------------------------- */

    /** JWTs are base64url, `atob` wants plain base64. Convert if needed. */
    private padBase64(base64Url: string): string {
        // replace URL-safe chars
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // pad with '=' to length % 4 === 0
        while (base64.length % 4) { base64 += '='; }
        return base64;
    }

    // logout method to clear the token
    logout(): void {
        localStorage.removeItem('token');
    }
}
