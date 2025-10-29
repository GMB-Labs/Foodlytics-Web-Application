import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomizerSettingsService } from '../../../../../core/customizer-settings/customizer-settings.service';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-active-project',
    imports: [MatCardModule, MatMenuModule, MatButtonModule, MatProgressBarModule, NgOptimizedImage],
    templateUrl: './active-project.component.html',
    styleUrl: './active-project.component.scss'
})
export class ActiveProjectComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}