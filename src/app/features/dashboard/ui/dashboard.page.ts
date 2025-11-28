import { Component } from "@angular/core";
import { ProjectsOverviewComponent } from "./widgets/projects-overview/projects-overview.component";
import { AllProjectsComponent } from "./widgets/all-projects/all-projects.component";
import { WorkingScheduleComponent } from "./widgets/working-schedule/working-schedule.component";
import { ToDoListComponent } from "./widgets/to-do-list/to-do-list.component";
import { TeamMembersComponent } from "./widgets/team-members/team-members.component";

@Component({
  selector: "app-dashboard-page",
  template: `
      <div class="row">
          <div class="col-lg-12 col-xxxl-8">
              <app-projects-overview />
              <app-all-projects />
              <app-to-do-list />
          </div>

          <div class="col-lg-12 col-xxxl-4">
              <app-working-schedule />
              <app-team-members />
          </div>
      </div>
  `,
  imports: [
    ProjectsOverviewComponent,
    AllProjectsComponent,
    WorkingScheduleComponent,
    ToDoListComponent,
    TeamMembersComponent,
  ],
})
export class DashboardPage {}
