import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CustomizerSettingsService } from '../../core/customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-search-page',
    imports: [MatButtonModule, MatCardModule],
    templateUrl: './search-page.component.html',
    styleUrl: './search-page.component.scss'
})
export class SearchPageComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}