import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { RouterLink } from "@angular/router";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-not-found",
  imports: [RouterLink, MatCardModule, MatButtonModule, NgOptimizedImage],
  templateUrl: "./not-found.component.html",
  styleUrl: "./not-found.component.scss",
})
export class NotFoundComponent {}
