import {afterNextRender, Component, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MostLeadsService } from './most-leads.service';
import {CustomizerSettingsService} from "../../../../../../core/customizer-settings/customizer-settings.service";

@Component({
    selector: 'app-most-leads',
    imports: [MatCardModule, MatMenuModule, MatButtonModule],
    templateUrl: './most-leads.component.html',
    styleUrl: './most-leads.component.scss'
})
export class MostLeadsComponent {

    public themeService = inject(CustomizerSettingsService);
    private mostLeadsService = inject(MostLeadsService);

    constructor() {
        afterNextRender(async () => {
            await this.mostLeadsService.loadChart()
        });
    }
}