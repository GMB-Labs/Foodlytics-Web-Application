import { ChangeDetectionStrategy, Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
    selector: 'app-dashboard-feature',
    template: `
            <router-outlet />        
    `,
    imports: [
        RouterOutlet
    ],
})
export class DashboardFeature {}