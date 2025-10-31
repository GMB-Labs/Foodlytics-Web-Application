import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { combineLatest, filter, map, take } from 'rxjs';

export const authRedirectGuard: CanMatchFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return combineLatest([auth.isLoading$, auth.isAuthenticated$]).pipe(
        filter(([loading]) => !loading),
        take(1),
        map(([, authed]) => (authed ? router.createUrlTree(['/dashboard']) : true))
    );
};