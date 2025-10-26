import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { WeeklyCaloriesBurnedService } from './weekly-calories-burned.service';

@Component({
    selector: 'app-weekly-calories-burned',
    imports: [MatCardModule, MatMenuModule, MatButtonModule],
    templateUrl: './weekly-calories-burned.component.html',
    styleUrl: './weekly-calories-burned.component.scss'
})
export class WeeklyCaloriesBurnedComponent {

    constructor(
        private complaintsService: WeeklyCaloriesBurnedService
    ) {}

    ngOnInit(): void {
        this.complaintsService.loadChart();
    }

}