import { Component } from "@angular/core";
import { WelcomeComponent } from "../components/welcome/welcome.component";
import { ProfileInformationComponent } from "../components/profile-information/profile-information.component";
import { RecentActivityComponent } from "../components/recent-activity/recent-activity.component";

@Component({
  selector: "app-profile",
  imports: [
    WelcomeComponent,
    ProfileInformationComponent,
    RecentActivityComponent,
  ],
  templateUrl: "./my-profile.component.html",
  styleUrl: "./my-profile.component.scss",
})
export class MyProfileComponent {}
