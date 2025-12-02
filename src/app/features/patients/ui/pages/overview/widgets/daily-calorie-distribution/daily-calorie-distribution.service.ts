import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import type { ApexOptions } from "apexcharts";
import { DailySummaryDay } from "../../../../../data-access/api/patient-daily-summaries.api";

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
export class DailyCalorieDistributionService {
  private isBrowser: boolean;
  private readonly instances = new WeakMap<
    HTMLElement,
    { destroy(): void }
  >();

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async loadChart(
    container: HTMLElement,
    summary: DailySummaryDay | null,
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

      // Extract data from summary or use empty state
      const protein = summary?.consumed.protein ?? 0;
      const carbs = summary?.consumed.carbs ?? 0;
      const fats = summary?.consumed.fats ?? 0;
      const totalCalories = summary?.consumed.calories ?? 0;

      const series = [protein, carbs, fats];
      const hasData = totalCalories > 0;

      // Get text color based on dark mode
      const isDark =
        typeof document !== "undefined" &&
        document.body.classList.contains("dark-theme");
      const textColor = isDark
        ? getComputedStyle(document.documentElement)
            .getPropertyValue("--whiteColor")
            .trim() || "#ffffff"
        : getComputedStyle(document.documentElement)
            .getPropertyValue("--blackColor")
            .trim() || "#475569";

      const options: ApexOptions = {
        series: hasData ? series : [],
        chart: {
          height: 350,
          type: "radialBar",
        },
        plotOptions: {
          radialBar: {
            dataLabels: {
              name: {
                fontSize: "22px",
                show: false,
              },
              value: {
                fontSize: "16px",
                show: false,
              },
              total: {
                show: true,
                label: "Total",
                formatter: () => {
                  return hasData ? String(Math.round(totalCalories)) : "—";
                },
                fontSize: "28px",
                fontWeight: 600,
                color: textColor,
              },
            },
          },
        },
        labels: ["Proteínas", "Carbohidratos", "Grasas"],
        colors: ["#0f79f3", "#ffb264", "#e74c3c"],
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
        console.error("Error loading ApexCharts:", error);
      }
    }
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
