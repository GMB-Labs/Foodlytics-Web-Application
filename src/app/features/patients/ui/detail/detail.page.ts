import {ChangeDetectionStrategy, Component} from "@angular/core";
import {CompletionStatusComponent} from "./widgets/completion-status/completion-status.component";
import {EnrolledStudentsComponent} from "./widgets/enrolled-students/enrolled-students.component";
import {ActiveCoursesComponent} from "./widgets/active-courses/active-courses.component";
import {WelcomeComponent} from "./widgets/welcome/welcome.component";
import {
    SemiCircularGaugeRadialbarChartComponent
} from "./widgets/semi-circular-gauge-radialbar-chart/semi-circular-gauge-radialbar-chart.component";
import {MultipleRadialbarChartComponent} from "./widgets/multiple-radialbar-chart/multiple-radialbar-chart.component";
import {TasksStatsComponent} from "./widgets/tasks-stats/tasks-stats.component";
import {BasicPieChartComponent} from "./widgets/basic-pie-chart/basic-pie-chart.component";
import {TimelineComponent} from "./widgets/timeline/timeline.component";
import {AveResolutionTimeComponent} from "./widgets/ave-resolution-time/ave-resolution-time.component";
import {FirstResponseTimeComponent} from "./widgets/first-response-time/first-response-time.component";
import {ComplaintsComponent} from "./widgets/complaints/complaints.component";

@Component({
    selector: 'app-detail-page',
    template: `
        <div class="row">
        <div class="col-lg-12 col-xxxl-12">
            <!-- Welcome -->
            <app-welcome />
        </div>
        <div class="col-lg-12 col-xxxl-12">
            <div class="row">
                <div class="col-md-4">
                    <!-- Active Courses -->
                    <app-active-courses />
                </div>
                <div class="col-md-4">
                    <!-- Enrolled Students -->
                    <app-enrolled-students />
                </div>
                <div class="col-md-4">
                    <!-- Completion Status -->
                    <app-completion-status />
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-6 col-xxxl-4">
                <!-- Semi Circular Gauge RadialBar Chart -->
                <app-semi-circular-gauge-radialbar-chart />
            </div>
            <div class="col-lg-6 col-xxxl-4">
                <!-- Multiple RadialBar Chart -->
                <app-multiple-radialbar-chart />
            </div>
            <div class="col-lg-6 col-xxxl-4">
                <!-- Basic Pie Chart -->
                <app-pie-chart />
            </div>
        </div>
        <div class="row">
            <div class="col-lg-6 col-xxxl-12">
                <!-- Tasks Stats -->
                <app-tasks-stats />   
            </div>
        </div>
        <app-timeline/>
        <div class="row">
            <div class="col-md-6 col-xxxl-6">
                <!-- First Response Time -->
                <app-first-response-time />
            </div>
            <div class="col-md-6 col-xxxl-6">
                <!-- Ave Resolution Time -->
                <app-ave-resolution-time />
            </div>
            <div class="col-lg-6 col-xxxl-12">
                <!-- Complaints -->
                <app-complaints />
            </div>
        </div>
    </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CompletionStatusComponent,
        EnrolledStudentsComponent,
        ActiveCoursesComponent,
        WelcomeComponent,
        SemiCircularGaugeRadialbarChartComponent,
        MultipleRadialbarChartComponent,
        TasksStatsComponent,
        BasicPieChartComponent,
        TimelineComponent,
        AveResolutionTimeComponent,
        FirstResponseTimeComponent,
        ComplaintsComponent,
    ]
})
export class DetailPage {}
