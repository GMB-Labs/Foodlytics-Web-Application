import {
  Injectable,
  Inject,
  PLATFORM_ID,
  inject,
  signal,
  computed,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import type { ApexOptions } from "apexcharts";
import { firstValueFrom } from "rxjs";
import {
  PhysicalActivityApiService,
  PhysicalActivityRangeResponse,
  PhysicalActivityDay,
} from "../../../../../data-access/api/physical-activity.api";
import { LoggerService } from "../../../../../../../core/logger/logger.service";

type ApexCtor = new (
  el: Element,
  opts: ApexOptions,
) => {
  render(): Promise<void>;
  destroy(): void;
};

@Injectable({
  providedIn: "root",
})
export class WeeklyCaloriesBurnedService {
  private readonly isBrowser: boolean;
  private readonly api = inject(PhysicalActivityApiService);
  private readonly logger = inject(LoggerService);
  private readonly instances = new WeakMap<
    HTMLElement,
    { destroy(): void }
  >();

  // Signals para compartir datos entre widgets
  private readonly weeklyActivityDaysSig = signal<PhysicalActivityDay[]>([]);
  private readonly weeklyActivityDataSig = signal<number[]>([]);

  // Exponer signals como computed para lectura
  readonly weeklyActivityDays = computed(() => this.weeklyActivityDaysSig());
  readonly weeklyActivityData = computed(() => this.weeklyActivityDataSig());

  // Computed signal para la suma total de calorías quemadas en la semana
  readonly weeklyBurnedTotal = computed(() => {
    const days = this.weeklyActivityDaysSig();
    return days.reduce((sum, day) => sum + (day.activity_count || 0), 0);
  });

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async loadChart(
    container: HTMLElement,
    userId: string | null,
    isDark: boolean,
  ): Promise<void> {
    if (!this.isBrowser || !container) {
      return;
    }

    if (!container.isConnected || !container.parentElement) {
      return;
    }

    this.destroy(container);

    if (!userId) {
      // If no userId, render empty chart
      await this.renderEmptyChart(container, isDark);
      return;
    }

    try {
      const ApexCharts = (await import("apexcharts"))
        .default as unknown as ApexCtor;

      if (!container.isConnected || !container.parentElement) {
        return;
      }

      // Calculate current week range (Monday to Sunday)
      const weekRange = this.getCurrentWeekRange();
      const { startDate, endDate, dayLabels, startDateObj } = weekRange;

      // Fetch data from API
      let activityData: number[] = [];
      let activityDays: PhysicalActivityDay[] = [];
      try {
        const response: PhysicalActivityRangeResponse = await firstValueFrom(
          this.api.getWeeklyActivity(userId, startDate, endDate),
        );
        if (response && response.days) {
          activityDays = response.days;
          activityData = this.mapActivityDataToWeek(
            response.days,
            startDateObj,
          );
          // Actualizar signals con los datos obtenidos
          this.weeklyActivityDaysSig.set(activityDays);
          this.weeklyActivityDataSig.set(activityData);
        } else {
          activityData = Array(7).fill(0);
          activityDays = [];
          // Actualizar signals con datos vacíos
          this.weeklyActivityDaysSig.set([]);
          this.weeklyActivityDataSig.set(activityData);
        }
      } catch (error) {
        this.logger.warn(
          "[WeeklyCaloriesBurnedService] Error loading weekly activity",
          error,
        );
        // Fill with zeros on error
        activityData = Array(7).fill(0);
        activityDays = [];
        // Actualizar signals con datos vacíos en caso de error
        this.weeklyActivityDaysSig.set([]);
        this.weeklyActivityDataSig.set(activityData);
      }

      // Get colors based on dark mode
      const colors = this.getChartColors(isDark);

      const options: ApexOptions = {
        series: [
          {
            name: "Calorías Quemadas",
            data: activityData,
          },
        ],
        chart: {
          height: 179,
          type: "line",
          zoom: {
            enabled: false,
          },
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: true,
        },
        colors: ["#796dF6"],
        stroke: {
          width: 2,
          curve: "smooth",
        },
        title: {
          text: this.getTitleText(activityData),
          align: "center",
          style: {
            fontSize: "14px",
            color: colors.text,
            fontWeight: "normal",
          },
        },
        grid: {
          show: true,
          strokeDashArray: 5,
          borderColor: colors.border,
          row: {
            colors: isDark
              ? ["rgba(255, 255, 255, 0.05)", "transparent"]
              : ["#f4f6fc", "transparent"],
            opacity: 0.5,
          },
        },
        yaxis: {
          tickAmount: 2,
          labels: {
            show: true,
            style: {
              colors: colors.text,
              fontSize: "14px",
            },
          },
        },
        xaxis: {
          categories: dayLabels,
          axisBorder: {
            show: false,
            color: colors.border,
          },
          axisTicks: {
            show: true,
            color: colors.border,
          },
          labels: {
            show: true,
            style: {
              colors: colors.text,
              fontSize: "14px",
            },
          },
        },
        tooltip: {
          theme: isDark ? "dark" : "light",
        },
      };

      const chart = new ApexCharts(container, options);
      await chart.render();

      if (container.isConnected) {
        this.instances.set(container, { destroy: () => chart.destroy() });
      } else {
        chart.destroy();
      }
    } catch (error) {
      if (this.isBrowser && container.isConnected) {
        this.logger.error(
          "[WeeklyCaloriesBurnedService] Error rendering chart:",
          error,
        );
        // Render empty chart on error
        await this.renderEmptyChart(container, isDark);
      }
    }
  }

  private async renderEmptyChart(
    container: HTMLElement,
    isDark: boolean,
  ): Promise<void> {
    try {
      const ApexCharts = (await import("apexcharts"))
        .default as unknown as ApexCtor;

      const { dayLabels } = this.getCurrentWeekRange();
      const colors = this.getChartColors(isDark);

      // Actualizar signals con datos vacíos
      this.weeklyActivityDaysSig.set([]);
      this.weeklyActivityDataSig.set(Array(7).fill(0));

      const options: ApexOptions = {
        series: [
          {
            name: "Calorías Quemadas",
            data: Array(7).fill(0),
          },
        ],
        chart: {
          height: 179,
          type: "line",
          zoom: { enabled: false },
          toolbar: { show: false },
        },
        dataLabels: { enabled: true },
        colors: ["#796dF6"],
        stroke: { width: 2, curve: "smooth" },
        title: {
          text: "No hay datos disponibles para esta semana.",
          align: "center",
          style: {
            fontSize: "14px",
            color: colors.text,
            fontWeight: "normal",
          },
        },
        grid: {
          show: true,
          strokeDashArray: 5,
          borderColor: colors.border,
          row: {
            colors: isDark
              ? ["rgba(255, 255, 255, 0.05)", "transparent"]
              : ["#f4f6fc", "transparent"],
            opacity: 0.5,
          },
        },
        yaxis: {
          tickAmount: 2,
          labels: {
            show: true,
            style: { colors: colors.text, fontSize: "14px" },
          },
        },
        xaxis: {
          categories: dayLabels,
          axisBorder: { show: false, color: colors.border },
          axisTicks: { show: true, color: colors.border },
          labels: {
            show: true,
            style: { colors: colors.text, fontSize: "14px" },
          },
        },
        tooltip: { theme: isDark ? "dark" : "light" },
      };

      const chart = new ApexCharts(container, options);
      await chart.render();

      if (container.isConnected) {
        this.instances.set(container, { destroy: () => chart.destroy() });
      } else {
        chart.destroy();
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  private getCurrentWeekRange(): {
    startDate: string;
    endDate: string;
    dayLabels: string[];
    startDateObj: Date;
  } {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate Monday (start of week)
    const monday = new Date(now);
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(now.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);

    // Calculate Sunday (end of week)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const startDate = this.formatDateToISO(monday);
    const endDate = this.formatDateToISO(sunday);

    // Generate day labels (Mon, Tue, Wed, etc.)
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayLabels: string[] = [];
    const current = new Date(monday);
    for (let i = 0; i < 7; i++) {
      const dayIndex = current.getDay();
      // Convert Sunday (0) to index 6, Monday (1) to 0, etc.
      const labelIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      dayLabels.push(dayNames[labelIndex]);
      current.setDate(current.getDate() + 1);
    }

    return { startDate, endDate, dayLabels, startDateObj: monday };
  }

  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private mapActivityDataToWeek(
    days: Array<{ day: string; activity_count: number }>,
    startDate: Date,
  ): number[] {
    // Create a map of day -> activity_count
    const dayMap = new Map<string, number>();
    days.forEach((d) => {
      dayMap.set(d.day, d.activity_count);
    });

    // Generate week data (Monday to Sunday)
    const weekData: number[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const dateStr = this.formatDateToISO(current);
      weekData.push(dayMap.get(dateStr) ?? 0);
      current.setDate(current.getDate() + 1);
    }

    return weekData;
  }

  private getTitleText(activityData: number[]): string {
    const maxValue = Math.max(...activityData);
    if (maxValue === 0) {
      return "No hay datos disponibles para esta semana.";
    }
    const maxIndex = activityData.indexOf(maxValue);
    const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return `El día con más calorías quemadas fue el ${dayNames[maxIndex]}.`;
  }

  private getChartColors(isDark: boolean): {
    text: string;
    border: string;
  } {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return {
        text: "#919aa3",
        border: "#e0e0e0",
      };
    }

    const root = document.documentElement;
    const getColor = (varName: string, fallback: string): string => {
      const value = getComputedStyle(root).getPropertyValue(varName).trim();
      return value || fallback;
    };

    return {
      text: isDark
        ? getColor("--mutedTextColor", "#94a3b8")
        : getColor("--bodyColor", "#919aa3"),
      border: isDark
        ? getColor("--borderColor", "#334155")
        : getColor("--borderColor", "#e0e0e0"),
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
