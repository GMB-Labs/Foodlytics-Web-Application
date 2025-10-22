import { ChangeDetectionStrategy, Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
    selector: 'app-patients-feature',
    template: `
            <router-outlet />        
    `,
    imports: [
        RouterOutlet
    ],
})
export class PatientsFeature {}