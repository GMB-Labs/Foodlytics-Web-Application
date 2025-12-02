import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  ViewChild,
  AfterViewInit,
  effect,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { DatePipe } from "@angular/common";
import { WelcomeService } from "../../../../../data-access/services/patient-stats.service";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { PatientDetailStore } from "../../../../../data-access/stores/patient-detail.store";

@Component({
  selector: "patients-welcome",
  imports: [
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    DatePipe,
  ],
  templateUrl: "./patients-welcome.component.html",
  styleUrl: "./patients-welcome.component.scss",
  providers: [DatePipe],
})
export class PatientsWelcomeComponent implements AfterViewInit {
  currentDate = signal(new Date());

  public themeService = inject(CustomizerSettingsService);
  private welcomeService = inject(WelcomeService);
  private readonly patientDetailStore = inject(PatientDetailStore);
  private destroyRef = inject(DestroyRef);

  @ViewChild("mpWelcomeChart", { static: false })
  chartRef!: ElementRef<HTMLDivElement>;

  protected readonly headerInfo = computed(() =>
    this.patientDetailStore.viewModel(),
  );
  protected readonly photoSrc = computed(() => this.patientDetailStore.photoUrl());
  protected readonly photoInitials = computed(() =>
    this.buildInitials(this.headerInfo().fullName),
  );
  protected readonly bmi = computed(() => this.patientDetailStore.bmi());

  constructor() {
    // Update chart when BMI changes
    effect(() => {
      const bmiValue = this.bmi();
      const chartEl = this.chartRef?.nativeElement;
      if (chartEl && bmiValue !== null && typeof window !== "undefined") {
        // Use setTimeout to avoid signal writes during effect execution
        setTimeout(() => {
          if (chartEl.isConnected) {
            this.welcomeService.loadChart(chartEl, bmiValue);
          }
        }, 0);
      }
    });

    let id: number | undefined;
    if (typeof window !== "undefined") {
      id = window.setInterval(() => {
        this.currentDate.set(new Date());
      }, 1000);
    }
    this.destroyRef.onDestroy(() => {
      if (id) {
        clearInterval(id);
        if (this.chartRef?.nativeElement) {
          this.welcomeService.destroy(this.chartRef.nativeElement);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    const bmiValue = this.bmi();
    if (this.chartRef?.nativeElement && bmiValue !== null) {
      this.welcomeService.loadChart(this.chartRef.nativeElement, bmiValue);
    }
  }

  private buildInitials(fullName?: string): string {
    const normalized = (fullName ?? "").trim();
    if (!normalized) return "P";

    const parts = normalized.split(/\s+/).filter(Boolean);
    const initials = parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

    return initials || "P";
  }
}
