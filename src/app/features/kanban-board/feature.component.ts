import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-kanban-board-feature',
    template: `<router-outlet />`,
    imports: [RouterOutlet]
})
export class AppsComponent {}