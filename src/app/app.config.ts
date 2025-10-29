import {
    ApplicationConfig, provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {provideClientHydration, withEventReplay, withIncrementalHydration} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi} from "@angular/common/http";
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideBreadcrumbsFromRouter} from "./shared/data-access/breadcrumb/breadcrumb.providers";
import {AuthHttpInterceptor, provideAuth0} from "@auth0/auth0-angular";

const isBrowser = typeof window !== 'undefined';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAuth0({
            domain: 'DOMINIO',
            clientId: 'CLIENT_ID',
            ...(isBrowser && {
                authorizationParams: {
                    redirect_uri: window.location.origin
                },
            }),
            httpInterceptor: { allowedList: ['/api/*'] }
        }),
        { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true},
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(withFetch(), withInterceptorsFromDi()),
        provideClientHydration(withIncrementalHydration()),
        provideZonelessChangeDetection(),
        provideBreadcrumbsFromRouter(),
        provideAnimations()
    ]
};