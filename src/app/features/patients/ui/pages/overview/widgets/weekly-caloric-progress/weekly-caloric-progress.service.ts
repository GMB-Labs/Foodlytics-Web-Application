import {
  Injectable,
  Inject,
  PLATFORM_ID,
  inject,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import type { ApexOptions } from "apexcharts";
import { firstValueFrom } from "rxjs";
import {
  PatientDailySummariesApiService,
  DailySummariesRangeResponse,
} from "../../../../../data-access/api/patient-daily-summaries.api";
import { PatientOverviewStatsService } from "../../../../../data-access/services/patient-overview-stats.service";
import { LoggerService } from "../../../../../../../core/logger/logger.service";

type ApexCtor = new (
  el: Element,
  opts: ApexOptions,
) => {
  render(): Promise<void>;
  destroy(): void;
  updateOptions(opts: ApexOptions, redrawPaths?: boolean, animate?: boolean): Promise<void>;
};

@Injectable({
  providedIn: "root",
})
export class WeeklyCaloricProgressService {
  private readonly isBrowser: boolean;
  private readonly api = inject(PatientDailySummariesApiService);
  private readonly logger = inject(LoggerService);
  private readonly instances = new WeakMap<
    HTMLElement,
    { destroy(): void; updateOptions(opts: ApexOptions): Promise<void> }
  >();

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async loadChart(
    container: HTMLElement,
    patientId: string,
    calorieTarget: number | null,
    statsService: PatientOverviewStatsService,
    isDark: boolean,
  ): Promise<void> {
    if (!this.isBrowser || !container) {
      return;
    }

    if (!container.isConnected || !container.parentElement) {
      return;
    }

    this.destroy(container);

    try {
      const ApexCharts = (await import("apexcharts"))
        .default as unknown as ApexCtor;

      if (!container.isConnected || !container.parentElement) {
        return;
      }

      // Calculate date range: last 7 days (today - 6 days to today)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);

      const startDateStr = this.formatDateToISO(startDate);
      const endDateStr = this.formatDateToISO(endDate);

      // Fetch data from API
      let days: Array<{
        day: string;
        consumed: { calories: number; protein: number; carbs: number; fats: number };
      }> = [];

      try {
        const response: DailySummariesRangeResponse = await firstValueFrom(
          this.api.getDailySummariesRange(patientId, startDateStr, endDateStr),
        );
        if (response && response.days) {
          days = response.days;
          statsService.setDailySummaries(days);
        }
      } catch (error) {
        this.logger.warn(
          "[WeeklyCaloricProgressService] Error loading daily summaries",
          error,
        );
        days = [];
      }

      // Generate day labels (short day names)
      const dayLabels = this.generateDayLabels(startDate, endDate, days);

      // Extract consumed calories
      const consumedData = days.map((d) => d.consumed.calories || 0);

      // Generate target data (flat array with target value)
      const targetValue = calorieTarget ?? 0;
      const targetData = Array(days.length).fill(targetValue);

      // Get colors from CSS variables
      const colors = this.getChartColors(isDark);

      const options: ApexOptions = {
        series: [
          {
            name: "Calorías diarias consumidas",
            data: consumedData,
          },
          {
            name: "Calorías diarias objetivo",
            data: targetData,
          },
        ],
        chart: {
          height: 225,
          type: "line",
          toolbar: {
            show: true,
          },
          events: {
            dataPointSelection: (_event, _ctx, opts) => {
              const index = opts.dataPointIndex;
              if (typeof index === "number") {
                statsService.selectDay(index);
              }
            },
            dataPointMouseEnter: (_event, _chartContext, config) => {
              const index = config.dataPointIndex;
              if (typeof index === "number") {
                statsService.setHoveredDay(index);
              }
            },
            dataPointMouseLeave: () => {
              statsService.clearHoveredDay();
            },
            mouseLeave: () => {
              statsService.clearHoveredDay();
            },
          },
        },
        colors: [colors.consumed, colors.target],
        dataLabels: {
          enabled: true,
        },
        stroke: {
          width: 2,
          curve: "straight",
          dashArray: [0, 8],
        },
        legend: {
          show: true,
          fontSize: "14px",
          labels: {
            colors: colors.text,
          },
        },
        markers: {
          size: 0,
          hover: {
            sizeOffset: 6,
          },
        },
        xaxis: {
          categories: dayLabels,
          axisBorder: {
            show: true,
            color: colors.border,
          },
          axisTicks: {
            show: true,
            color: colors.border,
          },
          labels: {
            trim: true,
            show: true,
            style: {
              colors: colors.text,
              fontSize: "14px",
            },
          },
        },
        yaxis: {
          tickAmount: 4,
          labels: {
            show: true,
            style: {
              colors: colors.text,
              fontSize: "14px",
            },
          },
        },
        grid: {
          strokeDashArray: 5,
          borderColor: colors.border,
        },
        tooltip: {
          theme: isDark ? "dark" : "light",
        },
      };

      const chart = new ApexCharts(container, options);
      await chart.render();

      if (container.isConnected) {
        this.instances.set(container, {
          destroy: () => chart.destroy(),
          updateOptions: (opts: ApexOptions) =>
            chart.updateOptions(opts, false, false),
        });
      } else {
        chart.destroy();
      }
    } catch (error) {
      if (this.isBrowser && container.isConnected) {
        console.error(
          "[WeeklyCaloricProgressService] Error rendering chart:",
          error,
        );
      }
    }
  }

  private formatDateToISO(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private generateDayLabels(
    startDate: Date,
    endDate: Date,
    days: Array<{ day: string }>,
  ): string[] {
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    // If we have days from API, use their dates
    if (days.length > 0) {
      return days.map((d) => {
        const date = new Date(d.day + "T00:00:00Z");
        return dayNames[date.getUTCDay()];
      });
    }

    // Otherwise generate labels for the date range
    const labels: string[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      labels.push(dayNames[current.getUTCDay()]);
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return labels;
  }

  private getChartColors(isDark: boolean): {
    consumed: string;
    target: string;
    text: string;
    border: string;
  } {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return {
        consumed: "#00cae3",
        target: "#e74c3c",
        text: "#475569",
        border: "#475569",
      };
    }

    const root = document.documentElement;
    const getColor = (varName: string, fallback: string): string => {
      const value = getComputedStyle(root).getPropertyValue(varName).trim();
      return value || fallback;
    };

    return {
      consumed: getColor("--daxaColor", "#00cae3"),
      target: getColor("--dangerColor", "#e74c3c"),
      text: isDark
        ? getColor("--mutedTextColor", "#94a3b8")
        : getColor("--bodyTextColor", "#475569"),
      border: isDark
        ? getColor("--borderColor", "#334155")
        : getColor("--borderColor", "#475569"),
    };
  }

  destroy(hostEl: HTMLElement): void {
    const current = this.instances.get(hostEl);
    if (current) {
      try {
        current.destroy();
      } finally {
        this.instances.delete(hostEl);
      }
    }
  }
}
