import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { BreadcrumbsComponent } from "../../shared/ui/breadcrumbs/breadcrumbs.component";
import { DashboardBootstrapService } from "./data-access/services/dashboard-bootstrap.service";

@Component({
  selector: "app-dashboard-feature",
  template: `
    <app-breadcrumbs />
    <router-outlet />
  `,
  imports: [RouterOutlet, BreadcrumbsComponent],
})
export class DashboardFeature {
  // Inyectar el servicio para inicializarlo cuando se carga el feature
  private readonly bootstrapService = inject(DashboardBootstrapService);
}
