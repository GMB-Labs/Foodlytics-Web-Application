import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class WeeklyCaloricProgressService {

    private readonly isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: [
                        {
                            name: "Calorías diarias consumidas",
                            data: [3100, 2400, 2700, 2800, 2500, 2600, 2400]
                        },
                        {
                            name: "Calorías diarias",
                            data: [2800, 2800, 2800, 2800, 2800, 2800, 2800]
                        }
                    ],
                    chart: {
                        height: 225,
                        type: "line",
                        toolbar: {
                            show: true
                        }
                    },
                    colors: [
                        "var(--daxaColor)", "var(--dangerColor)"
                    ],
                    dataLabels: {
                        enabled: true,
                    },
                    stroke: {
                        width: 2,
                        curve: "straight",
                        dashArray: [0, 8, 5]
                    },
                    legend: {
                        show: true,
                        fontSize: '14px',
                        labels: {
                            colors: "#475569"
                        }
                    },
                    markers: {
                        size: 0,
                        hover: {
                            sizeOffset: 6
                        }
                    },
                    xaxis: {
                        categories: [
                            "Lun",
                            "Mar",
                            "Mie",
                            "Jue",
                            "Vie",
                            "Sab",
                            "Dom",
                        ],
                        axisBorder: {
                            show: true,
                            color: '#475569'
                        },
                        axisTicks: {
                            show: true,
                            color: '#475569'
                        },
                        labels: {
                            trim: true,
                            show: true,
                            style: {
                                colors: "#475569",
                                fontSize: "14px"
                            }
                        }
                    },
                    yaxis: {
                        tickAmount: 4,
                        labels: {
                            show: true,
                            style: {
                                colors: "#475569",
                                fontSize: "14px"
                            }
                        }
                    },
                    grid: {
                        strokeDashArray: 5,
                        borderColor: "#475569",
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#crm_tasks_stats_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}