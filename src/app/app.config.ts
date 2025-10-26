import {
    ApplicationConfig, provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {provideClientHydration, withEventReplay, withIncrementalHydration} from '@angular/platform-browser';
import {provideHttpClient, withFetch} from "@angular/common/http";
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideBreadcrumbsFromRouter} from "./shared/data-access/breadcrumb.providers";


export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(withFetch()),
        provideClientHydration(withEventReplay(),withIncrementalHydration()),
        provideZonelessChangeDetection(),
        provideBreadcrumbsFromRouter(),
        provideAnimations()
    ]
};