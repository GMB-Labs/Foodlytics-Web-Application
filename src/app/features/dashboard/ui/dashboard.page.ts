import {Component} from '@angular/core';
import { ProjectsOverviewComponent } from './widgets/projects-overview/projects-overview.component';
import { ProjectsRoadmapComponent } from './widgets/projects-roadmap/projects-roadmap.component';
import { AllProjectsComponent } from './widgets/all-projects/all-projects.component';
import { ProjectsProgressComponent } from './widgets/projects-progress/projects-progress.component';
import { WorkingScheduleComponent } from './widgets/working-schedule/working-schedule.component';
import { ProjectsAnalysisComponent } from './widgets/projects-analysis/projects-analysis.component';
import { ChatProjectsUserComponent } from './widgets/chat-projects-user/chat-projects-user.component';
import { ToDoListComponent } from './widgets/to-do-list/to-do-list.component';
import { ActiveProjectComponent } from './widgets/active-project/active-project.component';
import { TeamMembersComponent } from './widgets/team-members/team-members.component';

@Component({
    selector: 'app-dashboard-page',
    template: `
    <div class="row">
        <div class="col-lg-12 col-xxxl-6">
            <!-- Projects Overview -->
            <app-projects-overview />
        </div>
        <div class="col-lg-12 col-xxxl-6">
            <!-- Projects Roadmap -->
            <app-projects-roadmap />
        </div>
        <div class="col-lg-8 col-xxxl-9">
            <!-- All Projects -->
            <app-all-projects />
        </div>
        <div class="col-lg-4 col-xxxl-3">
            <!-- Projects Progress -->
            <app-projects-progress />
        </div>
        <div class="col-lg-4">
            <!-- Working Schedule -->
            <app-working-schedule />
        </div>
        <div class="col-lg-8">
            <div class="row">
                <div class="col-lg-6">
                    <!-- Projects Analysis -->
                    <app-projects-analysis />
                </div>
                <div class="col-lg-6">
                    <!-- Chat Project User -->
                    <app-chat-projects-user />
                </div>
                <div class="col-lg-12">
                    <!-- To Do List -->
                    <app-to-do-list />
                </div>
            </div>
        </div>
        <div class="col-lg-8">
            <!-- Active Project -->
            <app-active-project />
        </div>
        <div class="col-lg-4">
            <!-- Team Members -->
            <app-team-members />
        </div>
    </div>
    `,
    imports: [ProjectsOverviewComponent, ProjectsRoadmapComponent, AllProjectsComponent, ProjectsProgressComponent, WorkingScheduleComponent, ProjectsAnalysisComponent, ChatProjectsUserComponent, ToDoListComponent, ActiveProjectComponent, TeamMembersComponent],
})
export class DashboardPage {}