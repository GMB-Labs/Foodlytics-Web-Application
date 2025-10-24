import {Component} from "@angular/core";
import {CompletionStatusComponent} from "./widgets/completion-status/completion-status.component";
import {ActiveCoursesComponent} from "./widgets/active-courses/active-courses.component";
import {WelcomeComponent} from "./widgets/welcome/welcome.component";
import {MultipleRadialbarChartComponent} from "./widgets/multiple-radialbar-chart/multiple-radialbar-chart.component";
import {TasksStatsComponent} from "./widgets/tasks-stats/tasks-stats.component";
import {TimelineComponent} from "./widgets/timeline/timeline.component";
import {AveResolutionTimeComponent} from "./widgets/ave-resolution-time/ave-resolution-time.component";
import {FirstResponseTimeComponent} from "./widgets/first-response-time/first-response-time.component";
import {ComplaintsComponent} from "./widgets/complaints/complaints.component";
import {MostLeadsComponent} from "./widgets/most-leads/most-leads.component";
import {EnrolledStudentsComponent} from "./widgets/enrolled-students/enrolled-students.component";
import {HeightCardComponent} from "./widgets/height-card/height-card.component";

@Component({
    selector: 'app-detail-page',
    template: `
        <div class="row">
            <div class="col-lg-12 col-xxxl-12">
                <!-- Welcome -->
                <app-welcome />
            </div>
            <div class="col-lg-8 col-xxxl-8">
                <div class="row">
                    <div class="col-lg-6">
                        <!-- Active Courses -->
                        <app-active-courses />
                    </div>
                    <div class="col-lg-6">
                        <!-- Completion Status -->
                        <app-completion-status />
                    </div>
                    <div class="col-lg-6">
                        <!-- Enrolled Students -->
                        <app-enrolled-students />
                    </div>
                    <div class="col-lg-6">
                        <!-- Height Card -->
                        <app-height-card />
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-xxl-4">
                <!-- Most Leads -->
                <app-most-leads />
            </div>
            <div class="col-lg-12 col-xxxl-12"> 
                <div class="row">
                    <div class="col-md-4">
                        <!-- Multiple RadialBar Chart -->
                        <app-multiple-radialbar-chart />
                    </div>
                    <div class="col-md-8">
                        <!-- Tasks Stats -->
                        <app-tasks-stats />
                    </div>
                </div>
            </div>
            <app-timeline/>
            <div class="col-md-12 col-xxxl-12">
                <div class="row">
                    <div class="col-md-6">
                        <!-- First Response Time -->
                        <app-first-response-time />
                    </div>
                    <div class="col-md-6">
                        <!-- Ave Resolution Time -->
                        <app-ave-resolution-time />
                    </div>
                </div>
            </div>
            <div class="col-lg-6 col-xxxl-12">
                <!-- Complaints -->
                <app-complaints />
            </div>
        </div>
    `,
    imports: [
        CompletionStatusComponent,
        ActiveCoursesComponent,
        WelcomeComponent,
        MultipleRadialbarChartComponent,
        TasksStatsComponent,
        TimelineComponent,
        AveResolutionTimeComponent,
        FirstResponseTimeComponent,
        ComplaintsComponent,
        MostLeadsComponent,
        EnrolledStudentsComponent,
        HeightCardComponent,
    ]
})
export class DetailPage {}
