import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { AvgExerciseTimeService } from "./avg-exercise-time.service";

@Component({
  selector: "app-avg-exercise-time",
  imports: [MatCardModule, MatMenuModule, MatButtonModule],
  templateUrl: "./avg-exercise-time.component.html",
  styleUrl: "./avg-exercise-time.component.scss",
})
export class AvgExerciseTimeComponent implements OnInit {
  constructor(private aveResolutionTimeService: AvgExerciseTimeService) {}

  ngOnInit(): void {
    this.aveResolutionTimeService.loadChart();
  }
}
