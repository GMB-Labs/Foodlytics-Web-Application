import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {CustomizerSettingsService} from "../../../../../../core/customizer-settings/customizer-settings.service";
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-weight-card',
    imports: [MatCardModule, NgOptimizedImage],
    templateUrl: './weight-card.component.html',
    styleUrl: './weight-card.component.scss'
})
export class WeightCardComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}