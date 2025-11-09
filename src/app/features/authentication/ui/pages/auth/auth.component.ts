import {Component, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from "@angular/common";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { AuthFacade } from "../../../../../core/auth/auth.facade";

@Component({
    selector: 'app-auth',
    imports: [RouterLink, MatButtonModule, NgOptimizedImage],
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss'
})
export class AuthComponent {
    public themeService = inject(CustomizerSettingsService)
    private readonly auth = inject(AuthFacade);

    login() {
        this.auth.login('/dashboard');
    }

    register() {
        this.auth.signup();
    }

    forgotPassword() {
        this.auth.forgotPassword();
    }

}