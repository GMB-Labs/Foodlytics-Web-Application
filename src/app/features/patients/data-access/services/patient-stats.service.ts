import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import type { ApexOptions } from "apexcharts";

type ApexCtor = new (
  el: Element,
  opts: ApexOptions,
) => { render(): Promise<void>; destroy(): void };

@Injectable({ providedIn: "root" })
export class WelcomeService {
  private readonly isBrowser: boolean;
  private readonly instances = new WeakMap<Element, { destroy(): void }>();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async loadChart(
    container: HTMLElement | null,
    bmi: number | null,
  ): Promise<void> {
    if (!this.isBrowser || !container || bmi === null) {
      return;
    }

    // Validate element is connected before proceeding
    if (!container.isConnected || !container.parentElement) {
      return;
    }

    this.destroy(container);

    try {
      const ApexCharts = (await import("apexcharts"))
        .default as unknown as ApexCtor;

      // Double-check element is still connected after async import
      if (!container.isConnected || !container.parentElement) {
        return;
      }

      // Normalize BMI to 0-100 for gauge (BMI range 15-35 maps to 0-100)
      // Clamp BMI between 15 and 35, then map to 0-100%
      const clampedBmi = Math.max(15, Math.min(35, bmi));
      const normalized = ((clampedBmi - 15) / (35 - 15)) * 100;
      const gaugeValue = Math.round(normalized);
      const bmiDisplay = bmi.toFixed(1);

      const options: ApexOptions = {
        series: [gaugeValue],
        chart: {
          type: "radialBar",
          height: 220,
          offsetY: 0,
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            hollow: {
              size: "70%",
              margin: 0,
              background: "transparent",
            },
            track: {
              background: "#2FCCAC",
              strokeWidth: "100%",
              margin: 3,
              dropShadow: { enabled: false },
            },
            dataLabels: {
              name: {
                show: false,
              },
              value: {
                show: true,
                offsetY: 8,
                fontSize: "28px",
                fontWeight: 600,
                color: "#ffffff",
                formatter: () => String(bmiDisplay),
              },
            },
          },
        },
        colors: ["#00cae3"],
      };
      const chart = new ApexCharts(container, options);
      await chart.render();

      // Final check before storing instance
      if (container.isConnected) {
        this.instances.set(container, chart);
      } else {
        chart.destroy();
      }
    } catch (error) {
      // Silently handle errors during SSR or when element is removed
      if (this.isBrowser && container.isConnected) {
        console.error("[WelcomeService] Error rendering radial chart:", error);
      }
    }
  }
  destroy(hostEl: Element): void {
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
