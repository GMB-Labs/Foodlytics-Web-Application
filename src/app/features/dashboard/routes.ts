import {Route, Routes} from "@angular/router";

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        title: 'Dashboard',
        loadComponent: () => import('./ui/dashboard.page').then(m => m.DashboardPage)
    }
]