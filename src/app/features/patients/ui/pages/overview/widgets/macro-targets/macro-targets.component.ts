import {Component, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MacroTargetsService } from './macro-targets.service';
import {CustomizerSettingsService} from "../../../../../../../core/customizer-settings/customizer-settings.service";
import {ApxChartDirective} from "../../../../../../../shared/charts";

@Component({
    selector: 'app-macro-targets',
    imports: [MatCardModule, MatMenuModule, MatButtonModule, ApxChartDirective],
    templateUrl: './macro-targets.component.html',
    styleUrl: './macro-targets.component.scss'
})
export class MacroTargetsComponent {

    public themeService = inject(CustomizerSettingsService);
    protected mostLeadsService = inject(MacroTargetsService);

}