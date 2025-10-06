import {ChangeDetectionStrategy, Component} from '@angular/core';
import { ProjectsOverviewComponent } from './ui/projects-overview/projects-overview.component';
import { ProjectsRoadmapComponent } from './ui/projects-roadmap/projects-roadmap.component';
import { AllProjectsComponent } from './ui/all-projects/all-projects.component';
import { ProjectsProgressComponent } from './ui/projects-progress/projects-progress.component';
import { WorkingScheduleComponent } from './ui/working-schedule/working-schedule.component';
import { ProjectsAnalysisComponent } from './ui/projects-analysis/projects-analysis.component';
import { ChatProjectsUserComponent } from './ui/chat-projects-user/chat-projects-user.component';
import { ToDoListComponent } from './ui/to-do-list/to-do-list.component';
import { ActiveProjectComponent } from './ui/active-project/active-project.component';
import { TeamMembersComponent } from './ui/team-members/team-members.component';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ProjectsOverviewComponent, ProjectsRoadmapComponent, AllProjectsComponent, ProjectsProgressComponent, WorkingScheduleComponent, ProjectsAnalysisComponent, ChatProjectsUserComponent, ToDoListComponent, ActiveProjectComponent, TeamMembersComponent],
})
export class DashboardPageComponent{}