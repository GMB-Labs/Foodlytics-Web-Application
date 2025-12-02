import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CompletedProfilesComponent } from "./completed-profiles/completed-profiles.component";
import { TotalPatientsComponent } from "./total-patients/total-patients.component";

@Component({
  selector: "app-patients-overview",
  imports: [
    MatCardModule,
    CompletedProfilesComponent,
    TotalPatientsComponent,
  ],
  templateUrl: "./patients-overview.component.html",
  styleUrl: "./patients-overview.component.scss",
})
export class PatientsOverviewComponent {}
