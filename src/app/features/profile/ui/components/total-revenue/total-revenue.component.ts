import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CustomizerSettingsService } from '../../../../../core/customizer-settings/customizer-settings.service';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-total-revenue',
    imports: [MatCardModule, NgOptimizedImage],
    templateUrl: './total-revenue.component.html',
    styleUrl: './total-revenue.component.scss'
})
export class TotalRevenueComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}