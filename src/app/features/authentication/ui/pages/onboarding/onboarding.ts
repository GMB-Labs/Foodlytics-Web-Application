import { Component } from '@angular/core';
import {MatFormField} from "@angular/material/form-field.d";
import {MatLabel} from "@angular/material/form-field-module.d";
import {MatInput} from "@angular/material/input";
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-onboarding',
    imports: [
        MatFormField,
        MatLabel,
        MatInput,
        MatStepper,
        MatStep,
        MatStepLabel,
        MatButton,
        MatStepperNext,
        MatStepperPrevious
    ],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class Onboarding {

}
