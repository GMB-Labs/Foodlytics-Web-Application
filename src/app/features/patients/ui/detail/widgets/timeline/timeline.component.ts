import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { CustomizerSettingsService } from '../../../../../../core/customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-timeline',
    imports: [MatButtonModule, MatMenuModule, MatCardModule],
    templateUrl: './timeline.component.html',
    styleUrl: './timeline.component.scss'
})
export class TimelineComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}