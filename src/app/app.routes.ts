import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/errors/not-found/not-found.component';
import { MoreChartsComponent } from './apexcharts/more-charts/more-charts.component';
import { PolarChartsComponent } from './apexcharts/polar-charts/polar-charts.component';
import { PieChartsComponent } from './apexcharts/pie-charts/pie-charts.component';
import { RadarChartsComponent } from './apexcharts/radar-charts/radar-charts.component';
import { RadialBarChartsComponent } from './apexcharts/radial-bar-charts/radial-bar-charts.component';
import { MixedChartsComponent } from './apexcharts/mixed-charts/mixed-charts.component';
import { ColumnChartsComponent } from './apexcharts/column-charts/column-charts.component';
import { AreaChartsComponent } from './apexcharts/area-charts/area-charts.component';
import { LineChartsComponent } from './apexcharts/line-charts/line-charts.component';
import { ApexchartsComponent } from './apexcharts/apexcharts.component';
import { InternalErrorComponent } from './shared/errors/internal-error/internal-error.component';
import { ComingSoonPageComponent } from './pages/coming-soon-page/coming-soon-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { TestimonialsPageComponent } from './pages/testimonials-page/testimonials-page.component';
import { GalleryPageComponent } from './pages/gallery-page/gallery-page.component';
import { TimelinePageComponent } from './pages/timeline-page/timeline-page.component';
import { TermsConditionsComponent } from './features/settings/terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './features/settings/privacy-policy/privacy-policy.component';
import { ConnectionsComponent } from './features/settings/connections/connections.component';
import { ChangePasswordComponent } from './features/settings/change-password/change-password.component';
import { AccountSettingsComponent } from './features/settings/account-settings/account-settings.component';
import { SettingsComponent } from './features/settings/settings.component';
import { MyProfileComponent } from './features/profile/my-profile.component';
import { PProjectsComponent } from './pages/profile-page/p-projects/p-projects.component';
import { TeamsComponent } from './pages/profile-page/teams/teams.component';
import { UserProfileComponent } from './pages/profile-page/user-profile/user-profile.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { MembersPageComponent } from './pages/members-page/members-page.component';
import { NotificationsPageComponent } from './pages/notifications-page/notifications-page.component';
import { PricingPageComponent } from './pages/pricing-page/pricing-page.component';
import { FaqPageComponent } from './pages/faq-page/faq-page.component';
import { StarterComponent } from './shared/starter/starter.component';
import { InvoiceDetailsComponent } from './pages/invoices-page/invoice-details/invoice-details.component';
import { InvoicesComponent } from './pages/invoices-page/invoices/invoices.component';
import { InvoicesPageComponent } from './pages/invoices-page/invoices-page.component';
import {KanbanBoardComponent} from "./apps/kanban-board/kanban-board.component";
import {AuthShellComponent} from "./layouts/auth-shell/auth-shell.component";
import {AppShellComponent} from "./layouts/app-shell/app-shell.component";

export const routes: Routes = [
    {
        path: 'auth',
        component: AuthShellComponent,
        children: [
            { path: '', loadChildren: () => import('./features/authentication/routes').then(m => m.AUTH_ROUTES) }
        ]
    },
    {
        path: '',
        component: AppShellComponent,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.page').then(m => m.DashboardPage) },
            { path: 'patients', loadChildren: () => import('./features/patients/routes').then(m => m.PATIENTS_ROUTES) },
            { path: 'calendar', loadComponent: () => import('./apps/calendar/calendar.component').then(m => m.CalendarComponent)},
            { path: 'kanban-board', component: KanbanBoardComponent},
            {
                path: 'invoices',
                component: InvoicesPageComponent,
                children: [
                    {path: '', component: InvoicesComponent},
                    {path: 'invoice-details', component: InvoiceDetailsComponent},
                ]
            },
            {path: 'starter', component: StarterComponent},
            {path: 'faq', component: FaqPageComponent},
            {path: 'pricing', component: PricingPageComponent},
            {path: 'notifications', component: NotificationsPageComponent},
            {path: 'members', component: MembersPageComponent},
            {
                path: 'profile',
                component: ProfilePageComponent,
                children: [
                    {path: '', component: UserProfileComponent},
                    {path: 'teams', component: TeamsComponent},
                    {path: 'projects', component: PProjectsComponent},
                ]
            },
            {path: 'profile', component: MyProfileComponent},
            {
                path: 'settings',
                component: SettingsComponent,
                children: [
                    {path: '', component: AccountSettingsComponent},
                    {path: 'change-password', component: ChangePasswordComponent},
                    {path: 'connections', component: ConnectionsComponent},
                    {path: 'privacy-policy', component: PrivacyPolicyComponent},
                    {path: 'terms-conditions', component: TermsConditionsComponent}
                ]
            },
            {path: 'timeline', component: TimelinePageComponent},
            {path: 'gallery', component: GalleryPageComponent},
            {path: 'testimonials', component: TestimonialsPageComponent},
            {path: 'search', component: SearchPageComponent},
            {path: 'coming-soon', component: ComingSoonPageComponent},
            {
                path: 'charts',
                component: ApexchartsComponent,
                children: [
                    {path: '', component: LineChartsComponent},
                    {path: 'area', component: AreaChartsComponent},
                    {path: 'column', component: ColumnChartsComponent},
                    {path: 'mixed', component: MixedChartsComponent},
                    {path: 'radialbar', component: RadialBarChartsComponent},
                    {path: 'radar', component: RadarChartsComponent},
                    {path: 'pie', component: PieChartsComponent},
                    {path: 'polar', component: PolarChartsComponent},
                    {path: 'more', component: MoreChartsComponent}
                ]
            },

        ]
    },

    // Here add new pages component
    {path: 'internal-error', component: InternalErrorComponent},
    {path: '**', component: NotFoundComponent} // This line will remain down from the whole pages component list
];