import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CustomizerSettingsService } from '../../../../../../core/customizer-settings/customizer-settings.service';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-active-projects',
    imports: [MatCardModule, NgOptimizedImage],
    templateUrl: './active-projects.component.html',
    styleUrl: './active-projects.component.scss'
})
export class ActiveProjectsComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}