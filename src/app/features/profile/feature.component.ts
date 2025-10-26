import { ChangeDetectionStrategy, Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
    selector: 'app-profile-feature',
    template: `
            <router-outlet />        
    `,
    imports: [
        RouterOutlet
    ],
})
export class ProfileFeature {}