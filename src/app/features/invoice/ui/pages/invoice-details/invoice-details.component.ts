import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { CustomizerSettingsService } from '../../../../../core/customizer-settings/customizer-settings.service';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-invoice-details',
    imports: [MatCardModule, MatMenuModule, MatButtonModule, NgOptimizedImage],
    templateUrl: './invoice-details.component.html',
    styleUrl: './invoice-details.component.scss'
})
export class InvoiceDetailsComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}