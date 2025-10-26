import { Routes } from '@angular/router';
import { NotFoundComponent } from './pages/errors/not-found/not-found.component';
import { InternalErrorComponent } from './pages/errors/internal-error/internal-error.component';
import { ComingSoonPageComponent } from './pages/coming-soon-page/coming-soon-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { TestimonialsPageComponent } from './pages/testimonials-page/testimonials-page.component';
import { GalleryPageComponent } from './pages/gallery-page/gallery-page.component';
import { TermsConditionsComponent } from './features/settings/ui/components/terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './features/settings/ui/components/privacy-policy/privacy-policy.component';
import { ChangePasswordComponent } from './features/settings/ui/components/change-password/change-password.component';
import { AccountSettingsComponent } from './features/settings/ui/components/account-settings/account-settings.component';
import { SettingsComponent } from './features/settings/ui/pages/settings.component';
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
                // actualizar
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
            {path: 'profile', loadComponent: () => import('./features/profile/ui/pages/my-profile.component').then(m => m.MyProfileComponent)},
            {
                // actualizar
                path: 'settings',
                component: SettingsComponent,
                children: [
                    {path: '', component: AccountSettingsComponent},
                    {path: 'change-password', component: ChangePasswordComponent},
                    {path: 'privacy-policy', component: PrivacyPolicyComponent},
                    {path: 'terms-conditions', component: TermsConditionsComponent}
                ]
            },
            {path: 'gallery', loadComponent: () => import('./pages/gallery-page/gallery-page.component').then(m => m.GalleryPageComponent) },
            {path: 'testimonials', loadComponent: () => import('./pages/testimonials-page/testimonials-page.component').then(m => m.TestimonialsPageComponent) },
            {path: 'search', loadComponent: () => import('./pages/search-page/search-page.component').then(m => m.SearchPageComponent)},
            {path: 'coming-soon', loadComponent: () => import('./pages/coming-soon-page/coming-soon-page.component').then(m => m.ComingSoonPageComponent)},
        ]
    },

    // Here add new pages component
    {path: 'internal-error', loadComponent: () => import('./pages/errors/internal-error/internal-error.component').then(m => m.InternalErrorComponent)},
    {path: '**', loadComponent: () => import('./pages/errors/not-found/not-found.component').then(m => m.NotFoundComponent)},
    // This line will remain down from the whole pages component list
];