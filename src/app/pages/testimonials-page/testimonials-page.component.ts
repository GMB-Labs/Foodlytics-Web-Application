import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CustomizerSettingsService } from '../../core/customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-testimonials-page',
    imports: [ MatCardModule],
    templateUrl: './testimonials-page.component.html',
    styleUrl: './testimonials-page.component.scss'
})
export class TestimonialsPageComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}