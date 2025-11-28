import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { map } from "rxjs/operators";
import { DailyCalorieTargetComponent } from "./widgets/daily-calorie-target/daily-calorie-target.component";
import { WeightCardComponent } from "./widgets/weight-card/weight-card.component";
import { WelcomeComponent } from "./widgets/welcome/welcome.component";
import { DailyCalorieDistributionComponent } from "./widgets/daily-calorie-distribution/daily-calorie-distribution.component";
import { WeeklyCaloricProgressComponent } from "./widgets/weekly-caloric-progress/weekly-caloric-progress.component";
import { TimelineComponent } from "./widgets/timeline/timeline.component";
import { AvgExerciseTimeComponent } from "./widgets/avg-exercise-time/avg-exercise-time.component";
import { AvgCaloriesBurnedComponent } from "./widgets/avg-calories-burned/avg-calories-burned.component";
import { WeeklyCaloriesBurnedComponent } from "./widgets/weekly-calories-burned/weekly-calories-burned.component";
import { MacroTargetsComponent } from "./widgets/macro-targets/macro-targets.component";
import { AgeCardComponent } from "./widgets/age-card/age-card.component";
import { HeightCardComponent } from "./widgets/height-card/height-card.component";
import { PatientDetailStore } from "../../../data-access/stores/patient-detail.store";

@Component({
  selector: "app-overview-page",
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
            <app-weight-card />
          </div>
          <div class="col-lg-6">
            <!-- Completion Status -->
            <app-daily-calorie-target />
          </div>
          <div class="col-lg-6">
            <!-- Enrolled Students -->
            <app-age-card />
          </div>
          <div class="col-lg-6">
            <!-- Height Card -->
            <app-height-card />
          </div>
        </div>
      </div>
      <div class="col-lg-4 col-xxl-4">
        <!-- Most Leads -->
        <app-macro-targets />
      </div>
      <div class="col-lg-12 col-xxxl-12">
        <div class="row">
          <div class="col-md-4">
            <!-- Multiple RadialBar Chart -->
            <app-daily-calorie-distribution />
          </div>
          <div class="col-md-8">
            <!-- Tasks Stats -->
            <app-weekly-caloric-progress />
          </div>
        </div>
      </div>
      <app-timeline />
      <div class="col-md-12 col-xxxl-12">
        <div class="row">
          <div class="col-md-6">
            <!-- First Response Time -->
            <app-avg-calories-burned />
          </div>
          <div class="col-md-6">
            <!-- Ave Resolution Time -->
            <app-avg-exercise-time />
          </div>
        </div>
      </div>
      <div class="col-lg-12 col-xxxl-12">
        <!-- Complaints -->
        <app-weekly-calories-burned />
      </div>
    </div>
  `,
  imports: [
    DailyCalorieTargetComponent,
    WeightCardComponent,
    WelcomeComponent,
    DailyCalorieDistributionComponent,
    WeeklyCaloricProgressComponent,
    TimelineComponent,
    AvgExerciseTimeComponent,
    AvgCaloriesBurnedComponent,
    WeeklyCaloriesBurnedComponent,
    MacroTargetsComponent,
    AgeCardComponent,
    HeightCardComponent,
  ],
})
export class DetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly patientDetailStore = inject(PatientDetailStore);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((params) => params.get("id")),
      )
      .subscribe((userId) => {
        this.patientDetailStore.loadPatient(userId);
      });
  }
}
