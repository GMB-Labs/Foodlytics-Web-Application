import {Component, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MostLeadsService } from './most-leads.service';
import {CustomizerSettingsService} from "../../../../../../core/customizer-settings/customizer-settings.service";
import {ApxChartDirective} from "../../../../../../shared/charts";

@Component({
    selector: 'app-most-leads',
    imports: [MatCardModule, MatMenuModule, MatButtonModule, ApxChartDirective],
    templateUrl: './most-leads.component.html',
    styleUrl: './most-leads.component.scss'
})
export class MostLeadsComponent {

    public themeService = inject(CustomizerSettingsService);
    protected mostLeadsService = inject(MostLeadsService);

}