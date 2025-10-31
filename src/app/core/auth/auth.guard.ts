import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { combineLatest, map, filter, take } from 'rxjs';

export const authGuard: CanActivateFn = (): ReturnType<CanActivateFn> => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return combineLatest([auth.isLoading$, auth.isAuthenticated$]).pipe(
        filter(([loading]) => !loading),
        take(1),
        map(([, authed]) => (authed ? true : router.createUrlTree(['/auth'])))
    );
};