import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    CanLoad,
    Route,
    Router,
    RouterStateSnapshot,
    UrlSegment
} from '@angular/router';
import {TokenService} from "../core/auth/token.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(private router: Router , private tokenService: TokenService) {}

    // ───────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────────────────────────────────────
    /** Replace this by your real check (token in localStorage, JWT expiry, etc.) */
    private isLoggedIn(): boolean {
        // return this.auth.isAuthenticated();
        return this.tokenService.isAuthenticated
    }

    private handleUnauthenticated(): boolean {
        this.router.navigate(['/auth/login']);
        return false;
    }

    // ───────────────────────────────────────────────────────────────────────────────
    // Guard Interfaces
    // ───────────────────────────────────────────────────────────────────────────────
    canActivate(
        _route: ActivatedRouteSnapshot,
        _state: RouterStateSnapshot
    ): boolean {
        return this.isLoggedIn() || this.handleUnauthenticated();
    }

    canActivateChild(
        _childRoute: ActivatedRouteSnapshot,
        _state: RouterStateSnapshot
    ): boolean {
        return this.canActivate(_childRoute, _state);
    }

    canLoad(route: Route, _segments: UrlSegment[]): boolean {
        // Using route.path lets you log or whitelist specific feature modules
        return this.isLoggedIn() || this.handleUnauthenticated();
    }
}
