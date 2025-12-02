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
import { MatCardModule } from "@angular/material/card";
import { DailyCalorieDistributionService } from "./daily-calorie-distribution.service";
import { PatientOverviewStatsService } from "../../../../../data-access/services/patient-overview-stats.service";

@Component({
  selector: "app-daily-calorie-distribution",
  imports: [MatCardModule],
  templateUrl: "./daily-calorie-distribution.component.html",
  styleUrl: "./daily-calorie-distribution.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyCalorieDistributionComponent
  implements OnInit, AfterViewInit
{
  private readonly multipleRadialbarChartService = inject(
    DailyCalorieDistributionService,
  );
  private readonly statsService = inject(PatientOverviewStatsService);

  @ViewChild("chartContainer", { static: false })
  chartContainer!: ElementRef<HTMLDivElement>;

  protected readonly selectedSummary = computed(() =>
    this.statsService.getSelectedSummary(),
  );

  constructor() {
    effect(() => {
      const summary = this.selectedSummary();
      if (this.chartContainer?.nativeElement) {
        this.multipleRadialbarChartService.loadChart(
          this.chartContainer.nativeElement,
          summary,
        );
      }
    });
  }

  ngOnInit(): void {
    // Effect will handle loading
  }

  ngAfterViewInit(): void {
    const summary = this.selectedSummary();
    if (this.chartContainer?.nativeElement) {
      this.multipleRadialbarChartService.loadChart(
        this.chartContainer.nativeElement,
        summary,
      );
    }
  }
}
