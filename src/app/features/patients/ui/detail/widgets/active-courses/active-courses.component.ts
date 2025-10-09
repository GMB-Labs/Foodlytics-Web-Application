import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {CustomizerSettingsService} from "../../../../../../core/customizer-settings/customizer-settings.service";
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-active-courses',
    imports: [MatCardModule, NgOptimizedImage],
    templateUrl: './active-courses.component.html',
    styleUrl: './active-courses.component.scss'
})
export class ActiveCoursesComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}