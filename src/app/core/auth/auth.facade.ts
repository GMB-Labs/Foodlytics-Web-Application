import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { ADMIN_ROLE, ROLES_CLAIM } from './auth.tokens';
import {map, Observable} from "rxjs";

type UserProfile = Record<string, unknown> & {
    name?: string;
    email?: string;
    picture?: string;
    [ROLES_CLAIM]?: string[];
};

@Injectable({ providedIn: 'root' })
export class AuthFacade {
    private readonly auth0 = inject(AuthService);

    // Base signals del SDK
    readonly isAuthenticated = toSignal(this.auth0.isAuthenticated$, { initialValue: false });
    readonly user = toSignal<UserProfile | null>(this.auth0.user$.pipe(map(u => u ?? null)), { initialValue: null });

    // Derivados
    readonly roles = computed<string[]>(() => this.user()?.[ROLES_CLAIM] ?? []);
    readonly isAdmin = computed<boolean>(() => this.roles().includes(ADMIN_ROLE));
    readonly displayName = computed(() => this.user()?.name ?? '');
    readonly email = computed(() => this.user()?.email ?? '');
    readonly avatar = computed(() => this.user()?.picture ?? '');

    // Métodos wrapper
    login(): Observable<void> {
        return this.auth0.loginWithRedirect();
    }

    logout(returnTo: string): void {
        this.auth0.logout({ logoutParams: { returnTo } });
    }

    getAccessTokenSilently(options?: Parameters<AuthService['getAccessTokenSilently']>[0]) {
        return this.auth0.getAccessTokenSilently(options);
    }
}