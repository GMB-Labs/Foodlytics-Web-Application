import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../core/customizer-settings/customizer-settings.service';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-coming-soon-page',
    imports: [RouterLink, MatButtonModule, MatMenuModule, MatFormFieldModule, MatInputModule, NgOptimizedImage],
    templateUrl: './coming-soon-page.component.html',
    styleUrl: './coming-soon-page.component.scss'
})
export class ComingSoonPageComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}