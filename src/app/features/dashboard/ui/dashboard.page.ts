import { Component } from "@angular/core";
import { PatientsOverviewComponent } from "./widgets/patients-overview/patients-overview.component";
import { PatientsListComponent } from "./widgets/patients-list/patients-list.component";
import { WorkingScheduleComponent } from "../../calendar/ui/component/working-schedule/working-schedule.component";
import { KanbanListComponent } from "./widgets/kanban/kanban-list.component";

@Component({
  selector: "app-dashboard-page",
  template: `
      <div class="row">
          <div class="col-lg-12 col-xxxl-8">
              <app-patients-overview />
              <app-patients-list />
          </div>
          <div class="col-lg-12 col-xxxl-4">
              <app-working-schedule mode="compact" />
              <app-kanban-list />
          </div>
      </div>
  `,
  imports: [
    PatientsOverviewComponent,
    PatientsListComponent,
    WorkingScheduleComponent,
    KanbanListComponent
  ],
})
export class DashboardPage {}
