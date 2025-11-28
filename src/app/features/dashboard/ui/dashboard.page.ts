import { Component } from "@angular/core";
import { ProjectsOverviewComponent } from "./widgets/projects-overview/projects-overview.component";
import { AllProjectsComponent } from "./widgets/all-projects/all-projects.component";
import { WorkingScheduleComponent } from "../../calendar/ui/component/working-schedule/working-schedule.component";
import { TeamMembersComponent } from "./widgets/team-members/team-members.component";
import { KanbanListComponent } from "./widgets/kanban/kanban-list.component";

@Component({
  selector: "app-dashboard-page",
  template: `
      <div class="row">
          <div class="col-lg-12 col-xxxl-8">
              <app-projects-overview />
              <app-all-projects />
              <app-kanban-list />
          </div>

          <div class="col-lg-12 col-xxxl-4">
              <app-working-schedule mode="compact" />
              <app-team-members />
          </div>
      </div>
  `,
  imports: [
    ProjectsOverviewComponent,
    AllProjectsComponent,
    WorkingScheduleComponent,
    TeamMembersComponent,
    KanbanListComponent
  ],
})
export class DashboardPage {}
