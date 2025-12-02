import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  effect,
  inject,
  computed,
} from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { WeeklyCaloricProgressService } from "./weekly-caloric-progress.service";
import { PatientDetailStore } from "../../../../../data-access/stores/patient-detail.store";
import { CalorieTargetsStore } from "../../../../../data-access/stores/calorie-targets.store";
import { PatientOverviewStatsService } from "../../../../../data-access/services/patient-overview-stats.service";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";

@Component({
  selector: "app-weekly-caloric-progress",
  imports: [MatCardModule, MatMenuModule, MatButtonModule],
  templateUrl: "./weekly-caloric-progress.component.html",
  styleUrl: "./weekly-caloric-progress.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyCaloricProgressComponent
  implements OnInit, AfterViewInit
{
  private readonly tasksStatsService = inject(WeeklyCaloricProgressService);
  private readonly patientDetailStore = inject(PatientDetailStore);
  private readonly calorieTargetsStore = inject(CalorieTargetsStore);
  private readonly statsService = inject(PatientOverviewStatsService);
  readonly themeService = inject(CustomizerSettingsService);

  @ViewChild("chartContainer", { static: false })
  chartContainer!: ElementRef<HTMLDivElement>;

  protected readonly patientId = computed(() =>
    this.patientDetailStore.currentUserId(),
  );
  protected readonly calorieTarget = computed(() =>
    this.calorieTargetsStore.totalCalories(),
  );

  constructor() {
    effect(() => {
      const patientId = this.patientId();
      const calorieTarget = this.calorieTarget();
      const isDark = this.themeService.isDarkSignal();
      if (patientId && this.chartContainer?.nativeElement) {
        this.tasksStatsService.loadChart(
          this.chartContainer.nativeElement,
          patientId,
          calorieTarget,
          this.statsService,
          isDark,
        );
      }
    });
  }

  ngOnInit(): void {
    // Effect will handle loading
  }

  ngAfterViewInit(): void {
    const patientId = this.patientId();
    const calorieTarget = this.calorieTarget();
    if (patientId && this.chartContainer?.nativeElement) {
      this.tasksStatsService.loadChart(
        this.chartContainer.nativeElement,
        patientId,
        calorieTarget,
        this.statsService,
        this.themeService.isDark(),
      );
    }
  }
}
