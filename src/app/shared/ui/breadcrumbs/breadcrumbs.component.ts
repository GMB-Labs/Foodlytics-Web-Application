// shared/ui/breadcrumbs/breadcrumbs.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../data-access/breadcrumb.service';

@Component({
    selector: 'app-breadcrumbs',
    imports: [RouterLink],
    host: { class: 'block' },
    template: `
    <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
      <h5 class="mb-0">{{ bc.title() }}</h5>

      <ol class="breadcrumb list-unstyled mt-0 mb-0 pl-0">
        @for (c of bc.trail(); track c.label; let i = $index; let last = $last) {
          <li class="breadcrumb-item position-relative">
            @if (!last && c.link) {
              <a [routerLink]="c.link" class="d-inline-block position-relative">
                @if (i === 0) { <i class="ri-home-8-line"></i> }
                {{ c.label }}
              </a>
            } @else {
              <span class="d-inline-block position-relative">
                @if (i === 0) { <i class="ri-home-8-line"></i> }
                {{ c.label }}
              </span>
            }
          </li>
        }
      </ol>
    </div>
  `
})
export class BreadcrumbsComponent {
    bc = inject(BreadcrumbService);
}