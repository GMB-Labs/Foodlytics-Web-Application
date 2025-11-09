import {inject, PLATFORM_ID} from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs/operators';

export const authRedirectGuard: CanMatchFn = (route, segments) => {
    const platformId = inject(PLATFORM_ID);
    if (!isPlatformBrowser(platformId)) return true;

    const path = '/' + segments.map(s => s.path).join('/');
    if (path === '/callback' || path == '/logout') return true;

    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.isAuthenticated$.pipe(
        map(isAuth => (isAuth ? router.createUrlTree(['/dashboard']) : true))
    );
};