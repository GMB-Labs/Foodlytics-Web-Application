import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { WeeklyCaloricProgressService } from "./weekly-caloric-progress.service";

@Component({
  selector: "app-weekly-caloric-progress",
  imports: [MatCardModule, MatMenuModule, MatButtonModule],
  templateUrl: "./weekly-caloric-progress.component.html",
  styleUrl: "./weekly-caloric-progress.component.scss",
})
export class WeeklyCaloricProgressComponent implements OnInit {
  constructor(private tasksStatsService: WeeklyCaloricProgressService) {}

  ngOnInit(): void {
    this.tasksStatsService.loadChart().then((r) => {});
  }
}
