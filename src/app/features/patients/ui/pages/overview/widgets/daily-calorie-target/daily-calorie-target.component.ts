import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {CustomizerSettingsService} from "../../../../../../../core/customizer-settings/customizer-settings.service";
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-daily-calorie-target',
    imports: [MatCardModule, NgOptimizedImage],
    templateUrl: './daily-calorie-target.component.html',
    styleUrl: './daily-calorie-target.component.scss'
})
export class DailyCalorieTargetComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}