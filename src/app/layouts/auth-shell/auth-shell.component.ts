import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
    selector: 'app-auth-shell',
    template: `
        <section class="auth-shell">
            <router-outlet/>
        </section>
    `,
    imports: [
        RouterOutlet
    ],
    host: { class: 'block' }
})
export class AuthShellComponent {}