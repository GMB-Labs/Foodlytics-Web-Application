import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {CustomizerSettingsService} from "../../../../../../customizer-settings/customizer-settings.service";
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-completion-status',
    imports: [MatCardModule, NgOptimizedImage],
    templateUrl: './completion-status.component.html',
    styleUrl: './completion-status.component.scss'
})
export class CompletionStatusComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}