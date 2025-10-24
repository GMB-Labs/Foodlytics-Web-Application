// src/app/shared/charts/apex-chart-manager.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { ApexOptions } from 'apexcharts';

interface ChartInstance {
    render(): Promise<void>;
    destroy(): void;
    updateOptions?(opts: ApexOptions, redraw?: boolean, animate?: boolean): Promise<void> | void;
    updateSeries?(series: ApexOptions['series'], animate?: boolean): Promise<void> | void;
}

type ApexCtor = new (el: Element, opts: ApexOptions) => ChartInstance;

@Injectable({ providedIn: 'root' })
export class ApexChartManager {
    private readonly isBrowser: boolean;
    private readonly instances = new WeakMap<HTMLElement, ChartInstance>();
    private readonly inflight = new WeakMap<HTMLElement, Promise<void>>();

    constructor(@Inject(PLATFORM_ID) platformId: object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    has(el: HTMLElement): boolean {
        return this.instances.has(el);
    }

    async mount(el: HTMLElement, options: ApexOptions, signal?: AbortSignal): Promise<void> {
        if (!this.isBrowser || !el.isConnected) return;

        const running = this.inflight.get(el);
        if (running) { await running; return; }

        this.destroy(el); // limpia si ya existía

        const task = this.mountWhenReady(el, options, signal)
            .finally(() => this.inflight.delete(el));

        this.inflight.set(el, task);
        await task;
    }

    async updateSeries(el: HTMLElement, series: ApexOptions['series']): Promise<void> {
        const chart = this.instances.get(el);
        await chart?.updateSeries?.(series);
    }

    async updateOptions(el: HTMLElement, opts: ApexOptions, redraw = false, animate = true): Promise<void> {
        const chart = this.instances.get(el);
        await chart?.updateOptions?.(opts, redraw, animate);
    }

    destroy(el: HTMLElement): void {
        const c = this.instances.get(el);
        if (c) {
            try { c.destroy(); } finally { this.instances.delete(el); }
        }
    }

    // ——— Internals ———
    private async mountWhenReady(el: HTMLElement, options: ApexOptions, signal?: AbortSignal): Promise<void> {
        await this.waitForStableSize(el, signal);
        if (signal?.aborted || !el.isConnected) return;

        const ApexCharts = (await import('apexcharts')).default as unknown as ApexCtor;
        const chart = new ApexCharts(el, options);
        await chart.render();

        if (signal?.aborted || !el.isConnected) {
            chart.destroy();
            return;
        }
        this.instances.set(el, chart);
    }

    private waitForStableSize(el: HTMLElement, signal?: AbortSignal): Promise<void> {
        return new Promise(resolve => {
            if (signal?.aborted || !el.isConnected) return resolve();

            const hasSize = () => el.clientWidth > 0 && el.clientHeight > 0;
            const twoFrames = (cb: () => void) =>
                requestAnimationFrame(() => requestAnimationFrame(cb));

            if (hasSize()) return twoFrames(resolve);

            const ro = new ResizeObserver(() => {
                if (hasSize()) { ro.disconnect(); twoFrames(resolve); }
            });
            ro.observe(el);

            const tick = () => {
                if (signal?.aborted) { ro.disconnect(); return resolve(); }
                if (hasSize()) { ro.disconnect(); return twoFrames(resolve); }
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);

            signal?.addEventListener('abort', () => { ro.disconnect(); resolve(); }, { once: true });
        });
    }
}