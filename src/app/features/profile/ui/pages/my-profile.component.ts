import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WelcomeComponent } from '../components/welcome/welcome.component';
import { TotalProjectsComponent } from '../components/total-projects/total-projects.component';
import { TotalRevenueComponent } from '../components/total-revenue/total-revenue.component';
import { TotalOrdersComponent } from '../components/total-orders/total-orders.component';
import { ProfileIntroComponent } from '../components/profile-intro/profile-intro.component';
import { ProfileInformationComponent } from '../components/profile-information/profile-information.component';
import { AdditionalInformationComponent } from '../components/additional-information/additional-information.component';
import { OverviewComponent } from '../components/overview/overview.component';
import { ToDoListComponent } from '../components/to-do-list/to-do-list.component';
import { RecentActivityComponent } from '../components/recent-activity/recent-activity.component';

@Component({
    selector: 'app-profile',
    imports: [RouterLink, WelcomeComponent, TotalProjectsComponent, TotalOrdersComponent, TotalRevenueComponent, ProfileIntroComponent, ProfileInformationComponent, AdditionalInformationComponent, OverviewComponent, ToDoListComponent, RecentActivityComponent],
    templateUrl: './my-profile.component.html',
    styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent {}