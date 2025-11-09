import {Component, inject, PLATFORM_ID} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../../../../core/customizer-settings/customizer-settings.service';
import { NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-logout',
    imports: [RouterLink, MatButtonModule, NgOptimizedImage],
    templateUrl: './logout.component.html',
    styleUrl: './logout.component.scss'
})
export class LogoutComponent {
    public themeService = inject(CustomizerSettingsService);
}