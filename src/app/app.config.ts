import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
} from "@angular/core";
import { provideRouter, withDebugTracing } from "@angular/router";
import { routes } from "./app.routes";
import {
  provideClientHydration,
  withIncrementalHydration,
} from "@angular/platform-browser";
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideBreadcrumbsFromRouter } from "./shared/data-access/breadcrumb/breadcrumb.providers";
import { provideServiceWorker } from "@angular/service-worker";
import { provideAuthWithRuntime } from "./core/auth/auth.providers";
import { provideNativeDateAdapter } from "@angular/material/core";

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideAuthWithRuntime(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withDebugTracing()),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideClientHydration(withIncrementalHydration()),
    provideAnimationsAsync(),
    provideBreadcrumbsFromRouter(),
    provideNativeDateAdapter(),
    provideServiceWorker("ngsw-worker.js", {
      enabled: !isDevMode(),
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
};
