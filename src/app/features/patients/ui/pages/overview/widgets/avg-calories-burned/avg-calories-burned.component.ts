import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { AvgCaloriesBurnedService } from "./avg-calories-burned.service";

@Component({
  selector: "app-avg-calories-burned",
  imports: [MatCardModule, MatMenuModule, MatButtonModule],
  templateUrl: "./avg-calories-burned.component.html",
  styleUrl: "./avg-calories-burned.component.scss",
})
export class AvgCaloriesBurnedComponent implements OnInit {
  constructor(private firstResponseTimeService: AvgCaloriesBurnedService) {}

  ngOnInit(): void {
    this.firstResponseTimeService.loadChart();
  }
}
