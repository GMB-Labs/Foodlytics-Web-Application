import {mergeApplicationConfig, ApplicationConfig, provideAppInitializer} from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import {provideNoopAnimations} from "@angular/platform-browser/animations";
import {provideAuthWithRuntime} from "./core/auth/auth.providers";

const serverConfig: ApplicationConfig = {
    providers: [
        provideServerRendering(withRoutes(serverRoutes)),
        ...provideAuthWithRuntime(),
        provideNoopAnimations()
    ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);