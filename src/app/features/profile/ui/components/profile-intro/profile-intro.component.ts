import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { CustomizerSettingsService } from '../../../../../core/customizer-settings/customizer-settings.service';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-profile-intro',
    imports: [MatCardModule, MatButtonModule, MatMenuModule, NgOptimizedImage],
    templateUrl: './profile-intro.component.html',
    styleUrl: './profile-intro.component.scss'
})
export class ProfileIntroComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}