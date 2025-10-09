import {ChangeDetectionStrategy, Component} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../../../core/customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-confirm-email',
    imports: [RouterLink, MatButtonModule],
    templateUrl: './confirm-email.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './confirm-email.component.scss'
})
export class ConfirmEmailComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}