import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { ApexOptions } from 'apexcharts';

type ApexCtor = new (el: Element, opts: ApexOptions) => { render(): Promise<void>; destroy(): void };

@Injectable({ providedIn: 'root' })
export class WelcomeService {
    private readonly isBrowser: boolean;
    private readonly instances = new WeakMap<Element, { destroy(): void }>();

    constructor(@Inject(PLATFORM_ID) platformId: object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    async renderRadial(hostEl: Element, value: number): Promise<void> {
        if (!this.isBrowser) return;

        this.destroy(hostEl);

        const ApexCharts = (await import('apexcharts')).default as unknown as ApexCtor;

        const options: ApexOptions = {
            series: [value],
            chart: { type: 'radialBar', height: 220 },
            plotOptions: {
                radialBar: {
                    startAngle: -90,
                    endAngle: 90,
                    track: {
                        background: '#2FCCAC',
                        strokeWidth: '100%',
                        margin: 3,
                        dropShadow: { enabled: false }
                    },
                    dataLabels: {
                        name: { show: false },
                        value: { offsetY: -2, fontSize: '25px', fontWeight: 500, color: '#ffffff' }
                    }
                }
            },
            colors: ['#00cae3']
        };
        const chart = new ApexCharts(hostEl, options);
        await chart.render();
        this.instances.set(hostEl, chart);
    }
    destroy(hostEl: Element): void {
        const current = this.instances.get(hostEl);
        if (current) {
            try { current.destroy(); } finally { this.instances.delete(hostEl); }
        }
    }
}