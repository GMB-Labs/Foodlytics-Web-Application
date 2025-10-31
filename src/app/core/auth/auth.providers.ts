// src/app/core/auth/auth.providers.ts
import {
    inject,
    isDevMode,
    PLATFORM_ID,
    provideEnvironmentInitializer,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthClientConfig, AuthHttpInterceptor, provideAuth0 } from '@auth0/auth0-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

const BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';

export function provideAuthWithRuntime() {
    return [
        provideEnvironmentInitializer(() => {
            const authCfg = inject(AuthClientConfig);
            const platformId = inject(PLATFORM_ID);
            const isBrowser = isPlatformBrowser(platformId);

            const g = globalThis as any;
            const browserDomain   = g.__RUNTIME_CONFIG__?.auth0Domain;
            const browserClientId = g.__RUNTIME_CONFIG__?.auth0ClientId;

            const serverDomain =
                !isBrowser && typeof process !== 'undefined'
                    ? (process.env['NG_APP_AUTH0_DOMAIN'] || '').trim()
                    : undefined;

            const serverClientId =
                !isBrowser && typeof process !== 'undefined'
                    ? (process.env['NG_APP_AUTH0_CLIENT_ID'] || '').trim()
                    : undefined;

            const domain   = isBrowser ? browserDomain : serverDomain;
            const clientId = isBrowser ? browserClientId : serverClientId;

            if (!domain || !clientId) {
                if (isDevMode()) {
                    console.error('[Auth0] Config faltante', {
                        where: isBrowser ? 'browser' : 'server',
                        domain, clientId,
                    });
                }
                return;
            }

            authCfg.set({
                domain,
                clientId,
                ...(isBrowser && {
                    authorizationParams: { redirect_uri: window.location.origin + '/auth/callback'}
                }),
                httpInterceptor: { allowedList: ['/api/*'] },
            });
            if (isBrowser) { // quitar, prueba, test
                const redirectUri = `${window.location.origin}/auth/callback`;
                console.log('[Auth0 redirect_uri usado]', redirectUri);
                console.log('[Auth0]', { domain, clientId, redirect: window.location.origin + '/auth/callback' });
            }
        }),

        ...(BROWSER
            ? [
                provideAuth0(),
                { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
            ]
            : []),
    ];
}