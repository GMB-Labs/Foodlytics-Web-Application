import {Component, inject, PLATFORM_ID} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../../../../core/customizer-settings/customizer-settings.service';
import {isPlatformBrowser, NgOptimizedImage} from "@angular/common";
import {MatCheckbox} from "@angular/material/checkbox";
import {AuthService} from "@auth0/auth0-angular";

@Component({
    selector: 'app-auth',
    imports: [RouterLink, MatButtonModule, NgOptimizedImage, MatCheckbox],
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss'
})
export class AuthComponent {
    public themeService = inject(CustomizerSettingsService)
    private readonly auth = inject(AuthService, { optional: true });
    private readonly platformId = inject(PLATFORM_ID);

    private get isBrowser()  {
        return isPlatformBrowser(this.platformId)
    }

    login() {
        if(!this.isBrowser || !this.auth) return;
        this.auth.loginWithRedirect();
    }

    register() {
        if(!this.isBrowser || !this.auth) return;
        this.auth.loginWithRedirect({authorizationParams: {screen_hint: 'signup'}});
    }

    forgotPassword() {
        if(!this.isBrowser || !this.auth) return;
        this.auth.loginWithRedirect();
    }
}