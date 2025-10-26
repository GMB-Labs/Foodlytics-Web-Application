import { Routes } from '@angular/router';
import { NotFoundComponent } from './pages/errors/not-found/not-found.component';
import { InternalErrorComponent } from './pages/errors/internal-error/internal-error.component';
import { ComingSoonPageComponent } from './pages/coming-soon-page/coming-soon-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { TestimonialsPageComponent } from './pages/testimonials-page/testimonials-page.component';
import { GalleryPageComponent } from './pages/gallery-page/gallery-page.component';
import { TermsConditionsComponent } from './features/settings/terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './features/settings/privacy-policy/privacy-policy.component';
import { ChangePasswordComponent } from './features/settings/change-password/change-password.component';
import { AccountSettingsComponent } from './features/settings/account-settings/account-settings.component';
import { SettingsComponent } from './features/settings/settings.component';
import { InvoiceDetailsComponent } from './pages/invoices-page/invoice-details/invoice-details.component';
import { InvoicesComponent } from './pages/invoices-page/invoices/invoices.component';
import { InvoicesPageComponent } from './pages/invoices-page/invoices-page.component';
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
            { path: 'dashboard', loadChildren: () => import('./features/dashboard/routes').then(m => m.DASHBOARD_ROUTES) },
            { path: 'patients', loadChildren: () => import('./features/patients/routes').then(m => m.PATIENTS_ROUTES) },
            { path: 'calendar', loadChildren: () => import('./features/calendar/routes').then(m => m.CALENDAR_ROUTES)},
            { path: 'kanban-board', loadChildren: () => import('./features/kanban-board/routes').then(m => m.KANBAN_BOARD_ROUTES) },
            {
                path: 'invoices',
                component: InvoicesPageComponent,
                children: [
                    {path: '', component: InvoicesComponent},
                    {path: 'invoice-details', component: InvoiceDetailsComponent},
                ]
            },
            {path: 'starter', loadComponent: () => import('./pages/starter/starter.component').then(m => m.StarterComponent)},
            {path: 'faq', loadComponent: () => import('./pages/faq-page/faq-page.component').then(m => m.FaqPageComponent)},
            {path: 'pricing', loadComponent: () => import('./pages/pricing-page/pricing-page.component').then(m => m.PricingPageComponent)},
            {path: 'notifications', loadComponent: () => import('./pages/notifications-page/notifications-page.component').then(m => m.NotificationsPageComponent)},
            {path: 'profile', loadComponent: () => import('./features/profile/my-profile.component').then(m => m.MyProfileComponent)},
            {
                path: 'settings',
                component: SettingsComponent,
                children: [
                    {path: '', component: AccountSettingsComponent},
                    {path: 'change-password', component: ChangePasswordComponent},
                    {path: 'privacy-policy', component: PrivacyPolicyComponent},
                    {path: 'terms-conditions', component: TermsConditionsComponent}
                ]
            },
            {path: 'gallery', component: GalleryPageComponent},
            {path: 'testimonials', component: TestimonialsPageComponent},
            {path: 'search', component: SearchPageComponent},
            {path: 'coming-soon', component: ComingSoonPageComponent},
        ]
    },

    // Here add new pages component
    {path: 'internal-error', component: InternalErrorComponent},
    {path: '**', component: NotFoundComponent} // This line will remain down from the whole pages component list
];