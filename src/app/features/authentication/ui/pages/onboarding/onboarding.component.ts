import { Component } from "@angular/core";
import { MatStepperModule } from "@angular/material/stepper";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatLabel } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from "@angular/material/card";

@Component({
  selector: "app-onboarding",
  imports: [
    MatStepperModule,
    MatFormFieldModule,
    MatLabel,
    MatInputModule,
    MatButtonModule,
    MatCardContent,
    MatCardTitle,
    MatCard,
    MatCardHeader,
  ],
  templateUrl: "./onboarding.component.html",
  styleUrl: "./onboarding.component.scss",
})
export class OnboardingComponent {}
