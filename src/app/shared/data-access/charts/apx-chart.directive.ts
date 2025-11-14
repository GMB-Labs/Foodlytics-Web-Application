import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  afterNextRender,
  effect,
  inject,
  input,
} from "@angular/core";
import { ApexChartManager } from "./apex-chart-manager.service";
import type { ApexOptions } from "apexcharts";

@Directive({
  selector: "[apxChart]",
  host: { "style.display": "block" },
})
export class ApxChartDirective {
  // Inputs (signals)
  options = input.required<ApexOptions>();
  series = input<ApexOptions["series"]>(undefined);
  height = input<number | string>(220);

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly manager = inject(ApexChartManager);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  constructor() {
    const host = this.el.nativeElement;

    effect(async () => {
      const s = this.series();
      if (!s || !this.manager.has(host)) return;
      await this.manager.updateSeries(host, s);
    });

    effect(async () => {
      const opts = this.options();
      if (!this.manager.has(host)) return;
      const merged = this.withHeight(opts, this.height());
      await this.manager.updateOptions(host, merged, false, true);
    });

    afterNextRender(() => {
      const h = this.height();
      host.style.minHeight = typeof h === "number" ? `${h}px` : `${h}`;

      const ctrl = new AbortController();
      this.destroyRef.onDestroy(() => ctrl.abort());

      this.zone.runOutsideAngular(async () => {
        const base = this.withHeight(this.options(), this.height());
        const initial: ApexOptions = {
          ...base,
          series: this.series() ?? base.series,
        };
        await this.manager.mount(host, initial, ctrl.signal);
      });
    });

    this.destroyRef.onDestroy(() => this.manager.destroy(host));
  }

  private withHeight(
    opts: ApexOptions,
    h: number | string | undefined,
  ): ApexOptions {
    const height = h ?? 220;
    return { ...opts, chart: { ...(opts.chart ?? {}), height } };
  }
}
