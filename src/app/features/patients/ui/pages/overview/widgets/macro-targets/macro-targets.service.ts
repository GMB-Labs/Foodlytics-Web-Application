import { Injectable, computed, signal } from "@angular/core";
import type { ApexOptions } from "apexcharts";

@Injectable({ providedIn: "root" })
export class MacroTargetsService {
  private readonly _series = signal<number[]>([55, 30, 10]);
  readonly series = computed(() => this._series());

  readonly labels = ["Email", "Social", "Call"] as const;

  readonly options = computed<ApexOptions>(() => ({
    chart: { type: "pie", width: 305 },
    stroke: { width: 2, show: true },
    labels: this.labels as unknown as string[],
    legend: { show: false },
    dataLabels: {
      enabled: false,
      style: { fontSize: "14px" },
      dropShadow: { enabled: false },
    },
    colors: ["#00cae3", "#0e7aee", "#796df6"],
    tooltip: { y: { formatter: (val: number) => `${val}%` } },
    responsive: [{ breakpoint: 768, options: { chart: { width: "100%" } } }],
  }));

  setSeries(next: number[]): void {
    this._series.set(next);
  }
}
