import {ChangeDetectionStrategy, Component} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../../../customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-logout',
    imports: [RouterLink, MatButtonModule],
    templateUrl: './logout.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './logout.component.scss'
})
export class LogoutComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}