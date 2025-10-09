import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CustomizerSettingsService } from '../../../core/customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-total-orders',
    imports: [MatCardModule],
    templateUrl: './total-orders.component.html',
    styleUrl: './total-orders.component.scss'
})
export class TotalOrdersComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}