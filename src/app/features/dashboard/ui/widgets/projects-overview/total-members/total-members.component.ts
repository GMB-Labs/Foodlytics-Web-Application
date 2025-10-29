import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CustomizerSettingsService } from '../../../../../../core/customizer-settings/customizer-settings.service';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-total-members',
    imports: [MatCardModule, NgOptimizedImage],
    templateUrl: './total-members.component.html',
    styleUrl: './total-members.component.scss'
})
export class TotalMembersComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}