import { Injectable, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable } from 'rxjs';
import { ADMIN_ROLE, ROLES_CLAIM } from './auth.tokens';

type UserProfile = Record<string, unknown> & {
    name?: string;
    email?: string;
    picture?: string;
    [ROLES_CLAIM]?: string[];
};

@Injectable({ providedIn: 'root' })
export class AuthFacade {
    private readonly auth0 = inject(AuthService);
    private readonly platformId = inject(PLATFORM_ID);

    readonly isLoading = toSignal(this.auth0.isLoading$, {initialValue: true})

    private get isBrowser() { return isPlatformBrowser(this.platformId); }

    private baseUrl(): string {
        if (!this.isBrowser) return '';
        // Si expusiste __RUNTIME_CONFIG__ con baseUrl, úsalo:
        const g = globalThis as any;
        return g.__RUNTIME_CONFIG__?.baseUrl ?? window.location.origin;
    }

    private buildReturnTo(fallbackPath = '/auth/logged-out'): string {
        return this.baseUrl() + fallbackPath;
    }

    // ------- Signals del SDK -------
    readonly isAuthenticated = toSignal(this.auth0.isAuthenticated$, { initialValue: false });
    readonly user = toSignal<UserProfile | null>(this.auth0.user$.pipe(map(u => u ?? null)), { initialValue: null });

    // ------- Derivados -------
    readonly roles = computed<string[]>(() => this.user()?.[ROLES_CLAIM] ?? []);
    readonly isAdmin = computed<boolean>(() => this.roles().includes(ADMIN_ROLE));
    readonly displayName = computed(() => this.user()?.name ?? '');
    readonly email = computed(() => this.user()?.email ?? '');
    readonly avatar = computed(() => this.user()?.picture ?? '');

    // ------- Auth actions -------
    login(): Observable<void> {
        if (!this.isBrowser) return new Observable<void>(s => { s.complete(); });
        return this.auth0.loginWithRedirect({
            authorizationParams: { redirect_uri: this.baseUrl() + '/auth/callback' }
        });
    }

    signup(): Observable<void> {
        if (!this.isBrowser) return new Observable<void>(s => { s.complete(); });
        return this.auth0.loginWithRedirect({
            authorizationParams: {
                screen_hint: 'signup',
                redirect_uri: this.baseUrl() + '/auth/callback'
            }
        });
    }

    /**
     * Logout: limpia tokens del SDK y cierra sesión en Auth0.
     * Opcionalmente returnTo.
     */
    logout(returnTo?: string): void {
        if (!this.isBrowser) return;
        this.defensiveLocalCleanup();
        this.auth0.logout({
            logoutParams: { returnTo: returnTo ?? this.buildReturnTo() }
        });
    }

    /**
     * Logout federated: intenta cerrar también la sesión del IdP (Google, etc.).
     * No todos los IdPs garantizan SLO.
     */
    logoutAll(returnTo?: string): void {
        if (!this.isBrowser) return;
        this.defensiveLocalCleanup();
        this.auth0.logout({
            logoutParams: {
                returnTo: returnTo ?? this.buildReturnTo(),
                federated: true
            }
        });
    }

    private defensiveLocalCleanup(): void {
        try {
            Object.keys(localStorage)
                .filter(k => k.startsWith('@@auth0spajs') || k.startsWith('auth0.'))
                .forEach(k => localStorage.removeItem(k));
            localStorage.removeItem('auth0.expiresAt');
            sessionStorage.removeItem('auth0.expiresAt');
        } catch { /* no-op */ }
    }

    getAccessTokenSilently(
        options?: Parameters<AuthService['getAccessTokenSilently']>[0]
    ) {
        return this.auth0.getAccessTokenSilently(options);
    }
}