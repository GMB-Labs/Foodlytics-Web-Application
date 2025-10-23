import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {CustomizerSettingsService} from "../../../../../../core/customizer-settings/customizer-settings.service";
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-height-card',
    imports: [MatCardModule, NgOptimizedImage],
    templateUrl: './height-card.component.html',
    styleUrl: './height-card.component.scss'
})
export class HeightCardComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}