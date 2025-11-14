import {inject, PLATFORM_ID} from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import {combineLatestWith, filter, map, take} from "rxjs";

export const authGuard: CanMatchFn = (): ReturnType<CanMatchFn> => {
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    const router = inject(Router);
    const auth = inject(AuthService);
    return auth.isLoading$.pipe(
        combineLatestWith(auth.isAuthenticated$),
        filter(([loading]) => !loading),
        take(1),
        map(([, authed]) => (authed ? true : router.createUrlTree(['/auth'])))
    );
};