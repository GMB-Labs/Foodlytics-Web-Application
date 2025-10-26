import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {BreadcrumbsComponent} from "../../shared/ui/breadcrumbs/breadcrumbs.component";

@Component({
    selector: 'app-calendar-feature',
    template: `
        <app-breadcrumbs />       
        <router-outlet />        
    `,
    imports: [
        RouterOutlet,
        BreadcrumbsComponent
    ],
})
export class CalendarFeature {}