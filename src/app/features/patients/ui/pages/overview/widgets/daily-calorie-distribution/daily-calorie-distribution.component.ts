import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DailyCalorieDistributionService } from './daily-calorie-distribution.service';

@Component({
    selector: 'app-daily-calorie-distribution',
    imports: [MatCardModule],
    templateUrl: './daily-calorie-distribution.component.html',
    styleUrl: './daily-calorie-distribution.component.scss'
})
export class DailyCalorieDistributionComponent {

    constructor(
        private multipleRadialbarChartService: DailyCalorieDistributionService
    ) {}

    ngOnInit(): void {
        this.multipleRadialbarChartService.loadChart();
    }

}