import { Routes } from '@angular/router';
import { AuthShellComponent } from "./layouts/auth-shell/auth-shell.component";
import { AppShellComponent } from "./layouts/app-shell/app-shell.component";
import {authRedirectGuard} from "./core/auth/auth.redirect.guard";
import {authGuard} from "./core/auth/auth.guard";

export const routes: Routes = [
    {
        path: 'auth',
        canActivate: [authRedirectGuard],
        component: AuthShellComponent,
        children: [
            { path: 'starter', loadComponent: () => import('./pages/starter/starter.component').then(m => m.StarterComponent)},
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
            { path: 'settings', loadChildren: () => import('./features/settings/routes').then(m => m.SETTINGS_ROUTES) },
            { path: 'invoices', loadChildren: () => import('./features/invoice/routes').then(m => m.INVOICE_ROUTES) },
            { path: 'profile', loadChildren: () => import('./features/profile/routes').then(m => m.PROFILE_ROUTES) },
            { path: 'pricing', loadChildren: () => import('./features/pricing/routes').then(m => m.PRICING_ROUTES) },
            // Pages
            { path: 'faq', loadComponent: () => import('./pages/faq-page/faq-page.component').then(m => m.FaqPageComponent)},
            { path: 'notifications', loadComponent: () => import('./pages/notifications-page/notifications-page.component').then(m => m.NotificationsPageComponent)},
            { path: 'gallery', loadComponent: () => import('./pages/gallery-page/gallery-page.component').then(m => m.GalleryPageComponent) },
            { path: 'testimonials', loadComponent: () => import('./pages/testimonials-page/testimonials-page.component').then(m => m.TestimonialsPageComponent) },
            { path: 'search', loadComponent: () => import('./pages/search-page/search-page.component').then(m => m.SearchPageComponent)},
            { path: 'coming-soon', loadComponent: () => import('./pages/coming-soon-page/coming-soon-page.component').then(m => m.ComingSoonPageComponent)},
        ]
    },

    // Here add new pages component
    { path: 'internal-error', loadComponent: () => import('./pages/errors/internal-error/internal-error.component').then(m => m.InternalErrorComponent)},
    { path: '**', loadComponent: () => import('./pages/errors/not-found/not-found.component').then(m => m.NotFoundComponent)},
    // This line will remain down from the whole pages component list
];