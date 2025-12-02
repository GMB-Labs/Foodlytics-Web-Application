import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  effect,
  inject,
  computed,
  signal,
} from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { AvgCaloriesBurnedService } from "./avg-calories-burned.service";
import { WeeklyCaloriesBurnedService } from "../weekly-calories-burned/weekly-calories-burned.service";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";

@Component({
  selector: "app-avg-calories-burned",
  imports: [MatCardModule, MatMenuModule, MatButtonModule],
  templateUrl: "./avg-calories-burned.component.html",
  styleUrl: "./avg-calories-burned.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvgCaloriesBurnedComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private readonly avgCaloriesService = inject(AvgCaloriesBurnedService);
  private readonly weeklyCaloriesService = inject(WeeklyCaloriesBurnedService);
  readonly themeService = inject(CustomizerSettingsService);

  @ViewChild("chartContainer", { static: false })
  chartContainer!: ElementRef<HTMLDivElement>;

  // Signal para el rango seleccionado (por defecto "Last 7 days")
  readonly selectedRange = signal<string>("Last 7 days");

  // Consumir el signal de suma total del servicio compartido
  readonly weeklyBurnedTotal = computed(() =>
    this.weeklyCaloriesService.weeklyBurnedTotal()
  );

  // Consumir los datos de actividad semanal
  readonly weeklyActivityData = computed(() =>
    this.weeklyCaloriesService.weeklyActivityData()
  );

  private chartInitialized = false;

  constructor() {
    // Effect para actualizar el gráfico cuando cambien los datos o el tema
    effect(() => {
      const isDark = this.themeService.isDarkSignal();
      const activityData = this.weeklyActivityData();
      const range = this.selectedRange();

      // Solo actualizar si el contenedor está disponible y el gráfico ya fue inicializado
      if (this.chartContainer?.nativeElement && this.chartInitialized) {
        // Solo actualizar si el rango es "Last 7 days" (usar datos reales)
        if (range === "Last 7 days") {
          this.avgCaloriesService.loadChart(
            this.chartContainer.nativeElement,
            activityData,
            isDark,
            range,
          );
        } else {
          // Para otros rangos, mantener el comportamiento actual (por ahora)
          this.avgCaloriesService.loadChart(
            this.chartContainer.nativeElement,
            null,
            isDark,
            range,
          );
        }
      }
    });
  }

  ngOnInit(): void {
    // Effect manejará la carga después de la inicialización
  }

  ngAfterViewInit(): void {
    const isDark = this.themeService.isDarkSignal();
    const activityData = this.weeklyActivityData();
    const range = this.selectedRange();

    if (this.chartContainer?.nativeElement) {
      this.chartInitialized = true;
      if (range === "Last 7 days") {
        this.avgCaloriesService.loadChart(
          this.chartContainer.nativeElement,
          activityData,
          isDark,
          range,
        );
      } else {
        this.avgCaloriesService.loadChart(
          this.chartContainer.nativeElement,
          null,
          isDark,
          range,
        );
      }
    }
  }

  ngOnDestroy(): void {
    if (this.chartContainer?.nativeElement) {
      this.avgCaloriesService.destroy(this.chartContainer.nativeElement);
    }
  }

  onRangeSelected(range: string): void {
    this.selectedRange.set(range);
  }
}
