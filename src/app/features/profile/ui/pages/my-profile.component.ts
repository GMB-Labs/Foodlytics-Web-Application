import { Component } from '@angular/core';
import { WelcomeComponent } from '../components/welcome/welcome.component';
import { TotalProjectsComponent } from '../components/total-projects/total-projects.component';
import { TotalRevenueComponent } from '../components/total-revenue/total-revenue.component';
import { TotalOrdersComponent } from '../components/total-orders/total-orders.component';
import { ProfileInformationComponent } from '../components/profile-information/profile-information.component';
import { OverviewComponent } from '../components/overview/overview.component';
import { ToDoListComponent } from '../components/to-do-list/to-do-list.component';
import { RecentActivityComponent } from '../components/recent-activity/recent-activity.component';

@Component({
    selector: 'app-profile',
    imports: [WelcomeComponent, TotalProjectsComponent, TotalOrdersComponent, TotalRevenueComponent, ProfileInformationComponent, OverviewComponent, ToDoListComponent, RecentActivityComponent],
    templateUrl: './my-profile.component.html',
    styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent {}