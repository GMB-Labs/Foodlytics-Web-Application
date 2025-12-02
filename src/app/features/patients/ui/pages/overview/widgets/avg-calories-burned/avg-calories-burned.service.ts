import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import type { ApexOptions } from "apexcharts";

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
export class AvgCaloriesBurnedService {
  private isBrowser: boolean;
  private readonly instances = new WeakMap<
    HTMLElement,
    {
      destroy(): void;
      updateOptions(
        opts: ApexOptions,
        redrawPaths?: boolean,
        animate?: boolean,
      ): Promise<void>;
    }
  >();

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async loadChart(
    container: HTMLElement,
    activityData: number[] | null,
    isDark: boolean,
    range: string = "Last 7 days",
  ): Promise<void> {
    if (!this.isBrowser || !container) {
      return;
    }

    if (!container.isConnected || !container.parentElement) {
      return;
    }

    try {
      // Dynamically import ApexCharts
      const ApexCharts = (await import("apexcharts"))
        .default as unknown as ApexCtor;

      if (!container.isConnected || !container.parentElement) {
        return;
      }

      // Si tenemos datos reales y el rango es "Last 7 days", usarlos
      let chartData: number[] = [];
      let labels: string[] = [];

      if (activityData && activityData.length === 7 && range === "Last 7 days") {
        // Usar datos reales de la semana
        chartData = activityData;
        // Generar etiquetas para los últimos 7 días (Mon-Sun)
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        labels = dayNames;
      } else {
        // Para otros rangos, usar datos mock (comportamiento anterior)
        chartData = [
          51, 65, 54, 56, 37, 53, 62, 24, 35, 46, 39, 27, 38, 61, 45, 27,
          54, 93, 41, 31,
        ];
        labels = [
          "13 Nov 2024",
          "14 Nov 2024",
          "15 Nov 2024",
          "16 Nov 2024",
          "17 Nov 2024",
          "20 Nov 2024",
          "21 Nov 2024",
          "22 Nov 2024",
          "23 Nov 2024",
          "24 Nov 2024",
          "27 Nov 2024",
          "28 Nov 2024",
          "29 Nov 2024",
          "30 Nov 2024",
          "01 Dec 2024",
          "04 Dec 2024",
          "05 Dec 2024",
          "06 Dec 2024",
          "07 Dec 2024",
          "08 Dec 2024",
        ];
      }

      // Obtener colores según el tema
      const colors = this.getChartColors(isDark);

      const options: ApexOptions = {
        series: [
          {
            name: "Calorías Quemadas",
            data: chartData,
          },
        ],
        chart: {
          type: "area",
          height: 200,
          zoom: {
            enabled: false,
          },
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "straight",
          width: 2,
        },
        colors: ["#ffb264"],
        labels: labels,
        xaxis: {
          type: range === "Last 7 days" ? "category" : "datetime",
          axisBorder: {
            show: false,
            color: colors.border,
          },
          axisTicks: {
            show: false,
            color: colors.border,
          },
          labels: {
            show: false,
            style: {
              colors: colors.text,
              fontSize: "14px",
            },
          },
        },
        yaxis: {
          labels: {
            show: false,
            style: {
              colors: colors.text,
              fontSize: "14px",
            },
          },
        },
        grid: {
          show: false,
          strokeDashArray: 5,
          borderColor: colors.border,
          row: {
            colors: ["#f4f6fc", "transparent"],
            opacity: 0,
          },
        },
        tooltip: {
          theme: isDark ? "dark" : "light",
          y: {
            formatter: function (val: any) {
              return val + " kcal";
            },
          },
        },
      };

      // Verificar si ya existe una instancia para este contenedor
      const existing = this.instances.get(container);
      if (existing) {
        // Actualizar opciones existentes
        await existing.updateOptions(options, false, true);
      } else {
        // Crear nueva instancia
        const chart = new ApexCharts(container, options);
        await chart.render();

        if (container.isConnected) {
          this.instances.set(container, {
            destroy: () => chart.destroy(),
            updateOptions: (
              opts: ApexOptions,
              redrawPaths?: boolean,
              animate?: boolean,
            ) => chart.updateOptions(opts, redrawPaths, animate),
          });
        } else {
          chart.destroy();
        }
      }
    } catch (error) {
      console.error("Error loading ApexCharts:", error);
    }
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

  destroy(hostEl?: HTMLElement): void {
    if (hostEl) {
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
}
