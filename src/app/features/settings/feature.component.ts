import { ChangeDetectionStrategy, Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
    selector: 'app-settings-feature',
    template: `
            <router-outlet />        
    `,
    imports: [
        RouterOutlet
    ],
})
export class SettingsFeature {}